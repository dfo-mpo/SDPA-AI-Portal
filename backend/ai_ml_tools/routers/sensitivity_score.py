from fastapi import APIRouter, File, UploadFile  
from ai_ml_tools.utils.pii import pii_analyze, file_to_path
  
router = APIRouter()  
  
@router.post("/sensitivity_score/")  
async def sensitivity_score(file: UploadFile = File(...)): 
    analyzer_results = await pii_analyze(await file_to_path(file))

    weights = {
        'PERSON': 0.05,
        'LOCATION': 0.05,
        'DATE_TIME': 0.02,
        'ORGANIZATION': 0.1,
        'PHONE_NUMBER': 0.3,
        'EMAIL_ADDRESS': 0.15,
        'CREDIT_CARD': 1.0,
        'NATIONAL_ID': 1.0,
    }
    for result in analyzer_results:
        print(result.entity_type)
    score = sum(weights.get(result.entity_type, 0) * 100 for result in analyzer_results)  # Convert to percentage
    return {"sensitivity_score": min(score, 100)}  # Ensure the score does not exceed 100%  