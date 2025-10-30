# ---------- Imports ----------
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import os
from pathlib import Path
from dotenv import load_dotenv

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

# Create a blob client to read blob files
def get_blob_service_client() -> BlobServiceClient:

    # build a connection string from name + key (like your Node example)
    if not STORAGE or not ACCOUNT_KEY:
        raise RuntimeError(
            "Missing storage creds: set AZURE_STORAGE_ACCOUNT_NAME and "
            "AZURE_STORAGE_ACCOUNT_KEY (or AZURE_ML_STORAGE_ACCOUNT_KEY)."
        )
    built_conn = (
        f"DefaultEndpointsProtocol=https;"
        f"AccountName={STORAGE};"
        f"AccountKey={ACCOUNT_KEY};"
        f"EndpointSuffix=core.windows.net"
    )
    return BlobServiceClient.from_connection_string(built_conn)

blob_service = get_blob_service_client()


# ---------- FastAPI ----------
router = APIRouter(prefix="/api", tags=["aml"])

# GET health
@router.get("/health")
def api_health():
    return {"ok": True, "workspace": WS, "tracking_uri": TRACKING_URI}

# GET Models using MLflow Tracking URI
@router.get("/models")
def api_list_models():
    client = MlflowClient()
    try:
        out: List[Dict[str, Any]] = []
        for rm in client.search_registered_models():
            latest = rm.latest_versions[0] if getattr(rm, "latest_versions", None) else None
            out.append({
                "name": rm.name,
                "description": getattr(rm, "description", None),
                "latest_version": getattr(latest, "version", None),
                "latest_stage": getattr(latest, "current_stage", None),
            })
        return out
    except RestException as e:
        # Some AML-managed MLflow builds reject certain default filters
        raise HTTPException(status_code=502, detail={"error": "mlflow_registry_error", "message": str(e)})

# GET the versions of a specific model
@router.get("/models/{name}/versions")
def api_list_model_versions(name: str):
    client = MlflowClient()
    try:
        versions = client.search_model_versions(f"name = '{name}'")
        payload: List[Dict[str, Any]] = []
        for v in versions:
            payload.append({
                "name": v.name,
                "version": v.version,
                "current_stage": v.current_stage,
                "run_id": v.run_id,
                "source": v.source,
                "description": getattr(v, "description", None),
                "creation_timestamp": getattr(v, "creation_timestamp", None),
                "last_updated_timestamp": getattr(v, "last_updated_timestamp", None),
                "tags": getattr(v, "tags", None),
            })
        try:
            payload.sort(key=lambda x: int(x["version"]), reverse=True)
        except Exception:
            pass
        return payload
    except RestException as e:
        raise HTTPException(status_code=502, detail={"error": "mlflow_registry_error", "message": str(e)})

# GET the blob files/folders from blob container
@router.get("/blobs")
def api_list_blobs():
    try:
        container = blob_service.get_container_client(CONTAINER)
        items: List[Dict[str, Any]] = []
        for b in container.list_blobs():
            items.append({
                "name": b.name,
                "size": getattr(b, "size", None),
                "content_type": getattr(getattr(b, "content_settings", None), "content_type", None),
                "last_modified": getattr(b, "last_modified", None),
            })
        return items
    except HttpResponseError as e:
        # 403s and others surface as clean JSON
        raise HTTPException(status_code=403, detail={"error": "blob_list_failed", "message": str(e)})