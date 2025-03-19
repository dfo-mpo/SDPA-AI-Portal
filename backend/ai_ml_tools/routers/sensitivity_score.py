import json
from fastapi import APIRouter, File, UploadFile, Form  
from ai_ml_tools.utils.pii import pii_analyze
from ai_ml_tools.utils.file import file_to_path
  
router = APIRouter()  
  
@router.post("/sensitivity_score/")  
async def sensitivity_score(file: UploadFile = File(...), settings: str = Form(None)): 
    analyzer_results = await pii_analyze(await file_to_path(file))
    
    # Default weights
    entityTypeWeights = {
        'PERSON': 0.05,
        'LOCATION': 0.05,
        'DATE_TIME': 0.02,
        'ORGANIZATION': 0.1,
        'PHONE_NUMBER': 0.3,
        'EMAIL_ADDRESS': 0.15,
        'CREDIT_CARD': 1.0,
        'NATIONAL_ID': 1.0,
    }
    
    entityTypeCategories = {
        'PERSON': 'personalInfo',
        'LOCATION': 'locationData',
        'DATE_TIME': 'businessInfo',
        'ORGANIZATION': 'businessInfo',
        'PHONE_NUMBER': 'personalInfo',
        'EMAIL_ADDRESS': 'personalInfo',
        'CREDIT_CARD': 'personalInfo',
        'NATIONAL_ID': 'personalInfo',
    }
    
    # for result in analyzer_results:
    #     print(result.entity_type)
    # score = sum(weights.get(result.entity_type, 0) * 100 for result in analyzer_results)  # Convert to percentage
    # return {"sensitivity_score": min(score, 100)}  # Ensure the score does not exceed 100%  
    
    # Override with custom weights if provided
    if settings:
        try:
            settings_obj = json.loads(settings)
            
            if 'categoryWeights' in settings_obj:
                category_weights = settings_obj['categoryWeights']

            # if 'enabledCategories' in settings_obj:
            #     enabled_categories = settings_obj['enabledCategories']
                
            # if 'entityWeights' in settings_obj:
            #     custom_weights = settings_obj['entityWeights']
            #     # Update weights with custom values
            #     for entity, weight in custom_weights.items():
            #         if entity in weights:
            #             weights[entity] = float(weight)
        except Exception as e:
            print(f"Error parsing settings: {e}")
    
    # for result in analyzer_results:
    #     print(result.entity_type)
    total_score = 0
    for result in analyzer_results:
        score = entityTypeWeights.get(result.entity_type, 0) * 100
        category = entityTypeCategories.get(result.entity_type, '')
        if category:
            category_weight = category_weights.get(category, 0) # TODO check if this should be 0
            score *= category_weight / 100
            total_score += score
    
    # score = sum(weights.get(result.entity_type, 0) * 100 for result in analyzer_results)  # Convert to percentage
    return {"sensitivity_score": min(total_score, 100)}  # Ensure the score does not exceed 100%