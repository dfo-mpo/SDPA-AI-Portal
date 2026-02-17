from ai_ml_tools.core.secrets import get_secret
import os

# make request to AKV for key or get cached secret for OPENAI_API_KEY
def get_OPENAI_API_KEY():
    key_vault_name = os.environ.get("KEY_VAULT_NAME")
    if key_vault_name: # key vault name is only defined in web app not local .env files
        return get_secret("OPENAI_API_KEY")
    else:
        return os.getenv("OPENAI_API_KEY")
    
# make request to AKV for key or get cached secret for OPENAI_API_KEY_US
def get_OPENAI_API_KEY_US():
    key_vault_name = os.environ.get("KEY_VAULT_NAME")
    if key_vault_name: # key vault name is only defined in web app not local .env files
        return get_secret("OPENAI_API_KEY_US")
    else:
        return os.getenv("OPENAI_API_KEY_US")
    
# make request to AKV for key or get cached secret for DI_API_KEY
def get_DI_API_KEY():
    key_vault_name = os.environ.get("KEY_VAULT_NAME")
    if key_vault_name: # key vault name is only defined in web app not local .env files
        return get_secret("DI_API_KEY")
    else:
        return os.getenv("DI_API_KEY")