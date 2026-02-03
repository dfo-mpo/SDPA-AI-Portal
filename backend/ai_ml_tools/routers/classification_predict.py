# Imports
import os
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile

# load env keys
load_dotenv()
PREDICTION_URL = os.getenv("CUSTOM_VISION_PREDICTION_URL")
PREDICTION_KEY = os.getenv("CUSTOM_VISION_PREDICTION_KEY")
if not PREDICTION_URL or not PREDICTION_KEY:
    raise RuntimeError(
        "Missing CUSTOM_VISION_PREDICTION_URL or CUSTOM_VISION_PREDICTION_KEY in .env"
    )

# define global vars
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_BYTES = 8 * 1024 * 1024  # 8MB

# helper function
async def call_custom_vision(image_bytes: bytes) -> Dict[str, Any]:
    headers = {
        "Prediction-Key": PREDICTION_KEY,
        "Content-Type": "application/octet-stream",
    }

    # Reuse a client per request
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(PREDICTION_URL, headers=headers, content=image_bytes)

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

# Predict endpoint
@router.post("/predict")
async def predict(image: UploadFile = File(...)):
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

    data = await call_custom_vision(img_bytes)
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
