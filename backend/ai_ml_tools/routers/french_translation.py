from fastapi import APIRouter, File, UploadFile
from ai_ml_tools.utils.file import file_to_path, pdf_to_text
import requests
import json

router = APIRouter()  

# Takes in a pdf and returns the french translation
# USE THIS AS MY ENDPOING. input is FILE FROM API SERVICE.
@router.post("/pdf_to_french/")
async def pdf_to_french(file: UploadFile = File(...)):
    text = pdf_to_text(await file_to_path(file))

    return await text_to_french(text)

# Takes in raw text and returns the french translation
# TODO: Implement solution using API
@router.post("/text_to_french/")  
async def text_to_french(text: str): 
    try:
        http_api = "http://20.63.108.34:8000"

        print(text)
        r = requests.post(http_api+'/translate', json={"engtext": text})
        
        data = json.dumps({'output': r.json()['output']})
        print(data)
        
        return {"translation": data}
    except Exception as e:
        print(f"data: {{'error': 'Error fetching data from API: {str(e)}'}}\n\n")