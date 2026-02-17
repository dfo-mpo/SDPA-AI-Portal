# Cache secrets from AKV to minimize the number of requests to get keys
from cachetools import TTLCache  
from ai_ml_tools.core.keyvault import secret_client  

cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes  
  
def get_secret(name: str) -> str:  
    if name in cache:  
        return cache[name]  
    
    try:
        secret = secret_client.get_secret(name).value  
        cache[name] = secret  
        return secret  
    except:
        print("Error retrieving key from AKV")
        return None