from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from PIL import Image
import numpy as np
import requests
from ai_ml_tools.utils.file import file_to_path, file_to_png

router = APIRouter()  

@router.post("/age_scale/")  
async def age_scale(
    file: UploadFile = File(...),
    enhance: bool = Form(False),
    species: str = Form("Chum")
    ):
    print(f"Received species: {species}")
    """
    Endpoint for scale ageing that processes the file
    and calls the scale_model_api function.
    """
    # Read inputted document
    tiff_file = await file_to_path(file)
    
    # Convert image to array
    image_array = image_to_array(tiff_file) 
    
    # Call the model API function
    result = await scale_model_api(image_array)
    
    # Return the result with the additional parameters
    return {
        "age": result["value"],  # Always a string
        "error": result["error"],  # Will be None if no error
        "enhanced": enhance,
        "species": species,
        "placeholder": False if result["error"] is None else "This result is a placeholder for the actual model output."
    }
    
# Helper function to convert image to array
def image_to_array(image_path):
    img = Image.open(image_path)
    img = Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return np.array(img).tolist()

# Function that calls the model API
async def scale_model_api(image_array):
    try:
        # http_api = "http://20.63.108.34:8000" # VM
        http_api = "https://ringtail-tops-hopelessly.ngrok-free.app" # Dat's local machine
        
        r = requests.post(http_api + '/scale', json={"imagelist": image_array})
        
        # Get the output from the response
        if r.status_code == 200 and "output" in r.json():
            return {"value": r.json()["output"], "error": None}
        else:
            raise Exception("Invalid response from model service")
            
    except requests.Timeout:
        return {"value": "Age 4", "error": "Model service timeout"}
    except requests.ConnectionError:
        return {"value": "Age 4", "error": "Could not connect to model service"}
    except Exception as e:
        return {"value": "Age 4", "error": f"Unexpected error: {str(e)}"}

@router.post("/to_png/")
async def to_png(file:UploadFile = File(...)):
    # Read inputted document
    tiff_file = await file_to_path(file)

    # Open the TIFF file and convert it to PNG  
    png_file = await file_to_png(tiff_file, png_name=None)

    headers = {  
        "Content-Disposition": f"attachment; filename={file.filename.split('.')[0]}",  
        "Content-Type": "image/png"  
    }  
      
    return StreamingResponse(png_file, headers=headers)  