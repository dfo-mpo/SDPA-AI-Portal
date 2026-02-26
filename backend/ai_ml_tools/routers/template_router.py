from fastapi import APIRouter, File, UploadFile, Query
from fastapi.responses import StreamingResponse, PlainTextResponse, JSONResponse, FileResponse
from fastapi import WebSocket, WebSocketDisconnect
# from ai_ml_tools.utils. import add imports from utils as needed

router = APIRouter()  

# Example POST request that takes in a file upload
@router.post("/route_path/")  
async def function_name(file: UploadFile = File(...)): # async is optional for HTTP requests
    # Add logic for what the router does

    # Add a return statement using one of the 'fastapi.responses' import objects
    return

# Example Web Socket
@router.websocket("/ws/route_path")
async def website_chat_min(ws: WebSocket): # web sockets should be always async
    await ws.accept()
    try:
        while True:
            # Add logic for Websocket, can look at web_scraper.py or chatbot.py for examples
            await ws.send_json({"done": True})
    except WebSocketDisconnect:
        return
    except Exception as e:
        try:
            await ws.send_json({"error": str(e)})
            await ws.close()
        except Exception:
            pass
