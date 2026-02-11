import os  
from azure.identity import DefaultAzureCredential  
from azure.keyvault.secrets import SecretClient  
  
KEY_VAULT_NAME = os.environ["KEY_VAULT_NAME"]  
KV_URI = f"https://{KEY_VAULT_NAME}.vault.azure.net"  
  
credential = DefaultAzureCredential()  
secret_client = SecretClient(vault_url=KV_URI, credential=credential)  