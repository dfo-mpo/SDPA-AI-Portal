from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse
from ai_ml_tools.utils.file import file_to_path

router = APIRouter()  
  
@router.post("/fence_counting/")  
async def fence_counting(file: UploadFile = File(...)):
    # TODO: Load video and run model on each frame, or pass to an API to use the model
    # video = await file_to_path(file)

    output_path = f"ai_ml_tools/data/{file.filename.split('.')[0]}-output.mp4"

    # Temp, load output file from cache TODO: remove this when model is used
    return StreamingResponse(interfile(output_path), media_type="video/mp4")


def interfile(file_path: str):
    with open(file_path, mode="rb") as file:  
        yield from file 