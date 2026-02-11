# Cache secrets from AKV to minimize the number of requests to get keys
from cachetools import TTLCache  
from keyvault import secret_client  

cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes  
  
def get_secret(name: str) -> str:  
    if name in cache:  
        return cache[name]  
  
    secret = secret_client.get_secret(name).value  
    cache[name] = secret  
    return secret  