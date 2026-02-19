# Imports
import os
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile
import ai_ml_tools.utils.azure_key_vault as keys

# load env keys
load_dotenv()

MODEL_CONFIG = None
CUSTOM_VISION_PREDICTION_KEY = os.getenv("CUSTOM_VISION_PREDICTION_KEY")
def set_MODEL_CONFIG():
    if not MODEL_CONFIG:
        MODEL_CONFIG = {
            "dog-cat": {
                "url": os.getenv("CUSTOM_VISION_DOG_VS_CAT_PREDICTION_URL"),
                "key": keys.get_CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY(),
            },
            "car-bike": {
                "url": os.getenv("CUSTOM_VISION_BIKE_VS_CAR_PREDICTION_URL"),
                "key": keys.get_CUSTOM_VISION_BIKE_VS_CAR_PREDICTION_KEY(),
            },
            "fresh-vs-infected-salmon": {
                "url": os.getenv("CUSTOM_VISION_FRESH_VS_INFECTED_SALMON_SPECIES_CLASSIFIER_URL"),
                "key": keys.get_CUSTOM_VISION_BIKE_VS_CAR_PREDICTION_KEY(),
            }
        }

MODEL_META = {
    "dog-cat": {"name": "Cat vs Dog", "description": "Binary classifier"},
    "car-bike": {"name": "Car vs Bike", "description": "Binary classifier"},
    "fresh-vs-infected-salmon" : {"name": "Fresh vs Infected Salmon", "description": "Binary Classifier"}
}

# define global vars
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_BYTES = 8 * 1024 * 1024  # 8MB

# helper function
async def call_custom_vision(url: str, key: str, image_bytes: bytes) -> Dict[str, Any]:
    headers = {
        "Prediction-Key": key,
        "Content-Type": "application/octet-stream",
    }

    # Reuse a client per request
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, content=image_bytes)

    if r.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "Custom Vision prediction failed",
                "status_code": r.status_code,
                "response": r.text,
            },
        )
    return r.json()

# FastAPI router and endpoints
router = APIRouter(prefix="/api", tags=["classification_model"])

# Health endpoint
@router.get("/health")
def health():
    return {"status": "ok"}

# get router (static for now, will be dynamic later on)
@router.get("/classificationmodels")
def list_models():
    items = []
    set_MODEL_CONFIG()
    for model_id, cfg in MODEL_CONFIG.items():
        # Only return models that are actually configured
        if cfg.get("url") and cfg.get("key"):
            meta = MODEL_META.get(model_id, {"name": model_id, "description": ""})
            items.append({"id": model_id, **meta})

    return {"items": items}

# Predict endpoint (model-specific)
@router.post("/predict/{model_id}")
async def predict(model_id: str, image: UploadFile = File(...)):
    await set_MODEL_CONFIG()
    cfg = MODEL_CONFIG.get(model_id)
    if not cfg or not cfg.get("url") or not cfg.get("key"):
        raise HTTPException(status_code=400, detail=f"Unknown/unconfigured model: {model_id}")

    filename = (image.filename or "").lower()
    ext = "." + filename.split(".")[-1] if "." in filename else ""
    if ext and ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTS)}",
        )

    img_bytes = await image.read()
    if not img_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(img_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large (> {MAX_BYTES} bytes).")

    # call the correct Custom Vision model
    data = await call_custom_vision(cfg["url"], cfg["key"], img_bytes)
    preds: List[Dict[str, Any]] = data.get("predictions", [])

    if not preds:
        print("No predictions returned from Custom Vision.")
        return {"label": None, "confidence": 0.0, "predictions": []}

    # Sort by probability and pick top
    preds_sorted = sorted(preds, key=lambda p: float(p.get("probability", 0.0)), reverse=True)
    top = preds_sorted[0]

    label = top.get("tagName")
    confidence = float(top.get("probability", 0.0))
    predictions = [
        {"label": p.get("tagName"), "confidence": float(p.get("probability", 0.0))}
        for p in preds_sorted
    ]

    # Print to server console/logs
    print("label:", label)
    print("confidence:", confidence)
    print("predictions:", predictions)

    # return results to frontend
    return {
        "label": label,
        "confidence": confidence,
        "predictions": predictions,
    }
