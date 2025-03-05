from fastapi import APIRouter  
from ai_ml_tools.routers import pii_redact, sensitivity_score
  
api_router = APIRouter()  

api_router.include_router(pii_redact.router)  
api_router.include_router(sensitivity_score.router)