from fastapi import APIRouter  
from ai_ml_tools.routers import pii_redact, sensitivity_score, age_scale, fence_count, french_translation, chatbot, analyzer, aml, web_scraper, documentOcr
  
api_router = APIRouter()  

api_router.include_router(pii_redact.router)  
api_router.include_router(sensitivity_score.router)
api_router.include_router(age_scale.router)
api_router.include_router(fence_count.router)
api_router.include_router(french_translation.router)
api_router.include_router(chatbot.router)
api_router.include_router(analyzer.router)
api_router.include_router(aml.router)
api_router.include_router(web_scraper.router)
api_router.include_router(documentOcr.router)