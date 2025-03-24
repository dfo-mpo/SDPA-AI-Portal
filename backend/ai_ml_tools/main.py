from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import api_router
from dotenv import load_dotenv
import os

# Load environment variables from .env file  
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))  

# To resolve dependancy issues with sqlite3 with Chroma
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

app = FastAPI()  

# Configure CORS  
origins = [  
    "http://localhost:3000",  # React frontend  
    "http://localhost:3001",  # React frontend  
    # Add other origins if needed  
]  

app.add_middleware(  
    CORSMiddleware,  
    allow_origins=origins,  
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(api_router)

@app.get("/")  
async def read_root():  
    return {"Hello": "World"}  

@app.get("/items/{item_id}")  
async def read_item(item_id: int, q: str = None):  
    return {"item_id": item_id, "q": q}  