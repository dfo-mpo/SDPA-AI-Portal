# ---------- Imports ----------
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import os
from pathlib import Path
from dotenv import load_dotenv
import io, shutil, tempfile, time
from starlette.background import BackgroundTask
from datetime import datetime, timezone

from azure.identity import DefaultAzureCredential
from azure.ai.ml import MLClient
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import HttpResponseError

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

# ---------- Simple in-memory caches ----------
_MODELS_CACHE: Dict[str, Any] = {"data": None, "ts": 0.0}
MODELS_CACHE_TTL = 300  # seconds

_README_CACHE: Dict[tuple, Dict[str, Any]] = {}
README_CACHE_TTL = 300  # seconds, per (name, version)


# ---------- Helpers ----------
def metaData(v):
    # Created time is already an ISO string on AML models
    ctx = getattr(v, "creation_context", None)

    # 1) Define when created
    created_on = (getattr(ctx, "created_at", None))

    # 2) Define when last updated
    last_updated_on = getattr(ctx, "last_modified_at", None) if ctx is not None else None

    # 3) Type and Flavour from AML Model Entity
    aml_type = getattr(v, "type", None)
    flavors = getattr(v, "flavors", None)

    # 4) Return metadata
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
def list_models(force: bool = False):
    now = time.time()

    # 0) Serve from cache if fresh and not forced
    if (
        not force
        and _MODELS_CACHE["data"] is not None
        and now - _MODELS_CACHE["ts"] < MODELS_CACHE_TTL
    ):
        return _MODELS_CACHE["data"]

    # 1) Access registered models
    try:
        regs = ml.models.list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {e}")

    # 2) Go throught all models + versions and output only latest version of a model
    out = []
    for model in regs:
        name = model.name
        try:
            versions = ml.models.list(name=name)
            if not versions:
                continue
            latest = max(versions, key=lambda x: int(x.version))
            out.append(metaData(latest))
        except Exception:
            continue

    # Newest first by last update
    out.sort(key=lambda x: x.get("last_updated_on") or "", reverse=True)

    # 3) Store in cache
    _MODELS_CACHE["data"] = out
    _MODELS_CACHE["ts"] = now

    return out

# GET all versions of a Model
@router.get("/models/{name}/versions")
def list_model_versions(name: str):
    try:
        versions = list(ml.models.list(name=name))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list versions for '{name}': {e}",
        )

    out = [metaData(v) for v in versions]
    # newest version number first
    try:
        out.sort(key=lambda x: int(x["version"]), reverse=True)
    except Exception:
        out.sort(key=lambda x: x.get("version", ""), reverse=True)

    return out


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


# GET the README for a model version (if present)
@router.get("/models/{name}/versions/{version}/readme")
def api_model_readme(name: str, version: str, force: bool = False):
    """
    Return README content (if any) for an AML model version.

    Shape:
    {
      "filename": "README.md",
      "media_type": "text/markdown",
      "content": "### My model\\n..."
    }
    """
    key = (name, str(version))
    now = time.time()

    # 0) Serve from cache if fresh and not forced
    cached = _README_CACHE.get(key)
    if (
        not force
        and cached is not None
        and now - cached["ts"] < README_CACHE_TTL
    ):
        status = cached.get("status")
        if status == 404:
            raise HTTPException(status_code=404, detail=cached.get("detail", "README not found"))
        return cached["data"]

    tmpdir = tempfile.mkdtemp(prefix=f"{name}_v{version}_")
    try:
        # Download all artifacts for that model version
        ml.models.download(name=name, version=version, download_path=tmpdir)

        # Look for README* in any subfolder
        readme_path = None
        for root, dirs, files in os.walk(tmpdir):
            for fname in files:
                lower = fname.lower()
                if lower.startswith("readme"):  # README, README.md, README.txt, etc.
                    readme_path = os.path.join(root, fname)
                    break
            if readme_path:
                break

        if not readme_path:
            detail = "README not found for this model version"
            # Cache the unsuccessful lookup
            _README_CACHE[key] = {
                "ok": False,
                "data": None,
                "status": 404,
                "detail": detail,
                "ts": now,
            }
            raise HTTPException(status_code=404, detail=detail)

        # Read content
        try:
            with open(readme_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(readme_path, "r", encoding="latin-1") as f:
                content = f.read()

        media_type = (
            "text/markdown"
            if readme_path.lower().endswith(".md")
            else "text/plain"
        )

        result = {
            "filename": os.path.basename(readme_path),
            "media_type": media_type,
            "content": content,
        }

        # Cache only successful reads
        _README_CACHE[key] = {"data": result, "ts": now}

        return result

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
