from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from ai_ml_tools.utils.file import file_to_path, file_to_png

router = APIRouter()  
  
@router.post("/age_scale/")  
async def age_scale(
    file: UploadFile = File(...),
    enhance: bool = Form(False),
    fish_type: str = Form("Chum")
    ):
    
    """
    Stubbed endpoint for scale ageing. It doesn't do real model inference; 
    it just returns placeholder data that we can replace later.
    """
    
    # Read inputted document
    tiff_file = await file_to_path(file)
    tiff_name = file.filename.split('.')[0]

    if enhance:
        # TODO
        print("Enhancing image... THIS IS A STUB. IMPLEMENT ENHANCEMENT.")
    
    # Get age from scale
    # TODO: add api call to server that runs model or run model here (if VM will host backend then this appoach may be chosen)
    
    
    # Temp hardcoded outputs
    print(tiff_name)
    output = "Age 4"
    if tiff_name == "Chum_SCL_2001_01":
        output = "Age 5"
    elif tiff_name == "Chum_SCL_2001_02":
        output = "Age 6"
    elif tiff_name == "Chum_SCL_2001_03":
        output = "Age 7" 
  
    return {
        "age": output,
        "enhanced": enhance,
        "fishType": fish_type,
        "placeholder": "This result is a placeholder for the actual model output."
        }

@router.post("/to_png")
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