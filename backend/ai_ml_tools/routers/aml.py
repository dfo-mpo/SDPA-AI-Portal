# ---------- Imports ----------
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import os
from pathlib import Path
from dotenv import load_dotenv
import io, shutil, tempfile
from starlette.background import BackgroundTask
from datetime import datetime, timezone

from azure.identity import DefaultAzureCredential
from azure.ai.ml import MLClient
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import HttpResponseError

import mlflow
from mlflow.tracking import MlflowClient
from mlflow.exceptions import RestException

# ---------- Config ----------
SUB_ID = os.getenv("AZURE_SUBSCRIPTION_ID")
RG = os.getenv("AZURE_RESOURCE_GROUP")
WS = os.getenv("AZURE_ML_WORKSPACE")

STORAGE = os.getenv("AZURE_ML_STORAGE_ACCOUNT_NAME")
CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER_MLMODELS")
ACCOUNT_KEY = os.getenv("AZURE_ML_STORAGE_ACCOUNT_KEY")

if not all([SUB_ID, RG, WS]):
    raise RuntimeError("Missing AZURE_SUBSCRIPTION_ID / AZURE_RESOURCE_GROUP / AZURE_ML_WORKSPACE")

# ---------- Auth / Clients ----------
cred = DefaultAzureCredential()

# AML control-plane (for discovering tracking URI)
ml = MLClient(cred, SUB_ID, RG, WS)

# Always derive the tracking URI from the workspace to avoid region mismatches
TRACKING_URI = ml.workspaces.get(WS).mlflow_tracking_uri
mlflow.set_tracking_uri(TRACKING_URI)
client = MlflowClient()


# ---------- Helpers ----------
def metaData(v):
    # 1) Define when created
    created_on = None
    if getattr(v, "creation_timestamp", None) is not None:
        created_on = datetime.fromtimestamp(int(v.creation_timestamp)/1000, tz=timezone.utc).isoformat()

    # 2) Define when last updated
    last_updated_on = None
    if getattr(v, "last_updated_timestamp", None) is not None:
        last_updated_on = datetime.fromtimestamp(int(v.last_updated_timestamp)/1000, tz=timezone.utc).isoformat()

    # 3) Type from Azure ML model entity
    try:
        am = ml.models.get(name=v.name, version=str(v.version))
        t = getattr(am, "type", None)
        aml_type = getattr(t, "name", str(t)) if t else None
        flavors = getattr(am, "flavors", None)
    except Exception:
        aml_type = None
        flavors = None

    # 3) Return metadata
    return {
        "name": v.name,
        "version": str(v.version),
        "description": getattr(v, "description", None),
        "type": aml_type,
        "flavors": flavors or None,
        "tags": getattr(v, "tags", {}) or None,
        "created_on": created_on,
        "last_updated_on": last_updated_on,
    }


# ---------- FastAPI ----------
router = APIRouter(prefix="/api", tags=["aml"])

# GET all models (latest)
@router.get("/models")
def list_models():
    # 1) Access registered models
    try:
        regs = client.search_registered_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {e}")

    # 2) Go throught all models + versions and output only latest version of a model
    out = []
    for rm in regs:
        name = getattr(rm, "name", None)
        if not name:
            continue
        try:
            versions = client.search_model_versions(f"name = '{name}'")
            if not versions:
                continue
            latest = max(versions, key=lambda x: int(getattr(x, "version", 0)))
            out.append(metaData(latest))
        except Exception:
            continue

    # Newest first by last update
    out.sort(key=lambda x: x.get("last_updated_on") or "", reverse=True)
    return out

# GET Model Name specific version
@router.get("/models/{name}/versions/{version}")
def get_model_version(name: str, version: str):
    try:
        v = client.get_model_version(name=name, version=str(version))
    except Exception:
        raise HTTPException(status_code=404, detail=f"Version '{version}' not found for model '{name}'")
    return metaData(v)

# GET the files/folders and download as ZIP
@router.get("/models/{name}/versions/{version}/download.zip")
def api_model_download_zip(name: str, version: str):
    # 1) Download the model to a temp dir via AML
    tmpdir = tempfile.mkdtemp(prefix=f"{name}_v{version}_")
    try:
        ml.models.download(name=name, version=version, download_path=tmpdir)
    except Exception as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise HTTPException(status_code=404, detail=f"Download failed for {name} v{version}: {e}")

    # 2) Create a zip with shutil.make_archive (one-liner) and serve it
    zip_path = shutil.make_archive(tmpdir, "zip", root_dir=tmpdir)
    filename = f"{name}_v{version}.zip"

    def cleanup():
        shutil.rmtree(tmpdir, ignore_errors=True)
        try: os.remove(zip_path)
        except: pass

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=filename,
        background=BackgroundTask(cleanup),
    )