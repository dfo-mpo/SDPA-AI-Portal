from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import api_router
from .routers import sensitivity_score

app = FastAPI()  

# Configure CORS  
origins = [  
    "http://localhost:3000",  # React frontend  
    # Add other origins if needed  
]  

app.add_middleware(  
    CORSMiddleware,  
    allow_origins=origins,  
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# app.include_router(sensitivity_score.router)
app.include_router(api_router)

@app.get("/")  
async def read_root():  
    return {"Hello": "World"}  

@app.get("/items/{item_id}")  
async def read_item(item_id: int, q: str = None):  
    return {"item_id": item_id, "q": q}  