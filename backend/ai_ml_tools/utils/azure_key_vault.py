import os
from dotenv import load_dotenv

load_dotenv()
using_AKV = True if os.environ.get("KEY_VAULT_NAME") else False

# make request to AKV for key or get cached secret for OPENAI_API_KEY
def get_OPENAI_API_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("azure-openai-api-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("OPENAI_API_KEY")
    
# make request to AKV for key or get cached secret for OPENAI_API_KEY_US
def get_OPENAI_API_KEY_US():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("azure-openai-api-key-us") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("OPENAI_API_KEY_US")
    
# make request to AKV for key or get cached secret for DI_API_KEY
def get_DI_API_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("azure-di-api-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("DI_API_KEY")

# make request to AKV for key or get cached secret for CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY
def get_CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("cv-dog-vs-cat-prediction-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY")

# make request to AKV for key or get cached secret for CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY
def get_CUSTOM_VISION_BIKE_VS_CAR_PREDICTION_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("cv-bike-vs-car-prediction-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("CUSTOM_VISION_BIKE_VS_CAR_PREDICTION_KEY")
    
# make request to AKV for key or get cached secret for CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY
def get_CUSTOM_VISION_PIZZA_VS_NOT_PIZZA_PREDICTION_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("cv-pizza-vs-not-pizza-prediction-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("CUSTOM_VISION_PIZZA_VS_NOT_PIZZA_PREDICTION_KEY")

# make request to AKV for key or get cached secret for CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY
def get_CUSTOM_VISION_APPLE_VS_ORANGE_PREDICTION_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("cv-apple-vs-orange-prediction-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("CUSTOM_VISION_APPLE_VS_ORANGE_PREDICTION_KEY")

# make request to AKV for key or get cached secret for CUSTOM_VISION_DOG_VS_CAT_PREDICTION_KEY
def get_CUSTOM_VISION_SALMON_SPECIES_CLASSIFIER_KEY():
    if using_AKV: # key vault name is only defined in web app not local .env files
        from ai_ml_tools.core.secrets import get_secret # want managed identity to be ready before loading import, (so we don't import until running the function)
        return get_secret("cv-salmon-species-classifier-key") # AKV does not allow caps and underscores in secret names
    else:
        return os.getenv("CUSTOM_VISION_SALMON_SPECIES_CLASSIFIER_KEY")