from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ai_ml_tools.utils.file import extract_col_prompts
from ai_ml_tools.models.document import Document
import json
import csv
import io

router = APIRouter()  

# # Takes in a pdf and returns the french translation
# @router.post("/openai_csv_analyze/")
# async def pdf_csv_analyzer(csv_file: UploadFile = File(...), pdf_file: UploadFile = File(...), outputType="json"):
#     header_list = extract_col_prompts(csv_file)
    
#     # Add the token_threshold parameter
#     token_threshold = 10000
    
#     doc = Document(pdf_file, header_list, token_threshold)

#     # Get OpenAI responces
#     responses, tokens = doc.get_openai_responses()
#     structured_data = convert_responces_to_json(responses)
#     print(tokens) # TODO: add return for tokens maybe, this would be difficult since you cant return differnt object types (eg no json and stream responce at once)

#     if outputType == "json":
#         # Output resulting json file
#         structured_json = json.dumps(structured_data, indent=4)

#         return StreamingResponse(io.BytesIO(structured_json.encode('utf-8')), media_type="application/json")
#     elif outputType == "csv":
#         # Reconstruct to CSV and output file 
#         csv_output = io.StringIO()  
#         csvwriter = csv.writer(csv_output) 

#         headers = [item['header'] for item in structured_data]   
#         csvwriter.writerow(headers)  

#         responses = [item['response'] for item in structured_data]  
#         csvwriter.writerow(responses)  

#         sources = [item['source'] for item in structured_data]  
#         csvwriter.writerow(sources)

#         csv_output.seek(0)  
#         return StreamingResponse(csv_output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=result.csv"})
#     else:   
#         # Return a JSON error response  
#         return JSONResponse(  
#             status_code=400,  
#             content={"error": "Invalid outputType provided. Valid options are 'json' or 'csv'."}  
#         )  

#### **** UNCOMMENT THIS BLOCK WHEN DONE WITH MOCKING **** ####

@router.post("/openai_csv_analyze/")
async def pdf_csv_analyzer(csv_file: UploadFile = File(...), pdf_file: UploadFile = File(...), outputType="json"):
    try:
        print(f"Processing CSV file: {csv_file.filename}")
        print(f"Processing PDF file: {pdf_file.filename}")
        
        # Extract headers and prompts from CSV
        header_list = extract_col_prompts(csv_file)
        
        # Set a default token threshold
        token_threshold = 10000
        
        # Create document with PDF and header list
        doc = Document(pdf_file, header_list, token_threshold)
        
        # Get OpenAI responses
        responses, tokens = doc.get_openai_responses()
        structured_data = convert_responces_to_json(responses)
        print(f"Tokens used: {tokens}")

        if outputType == "json":
            # Output resulting json file
            structured_json = json.dumps(structured_data, indent=4)
            return StreamingResponse(io.BytesIO(structured_json.encode('utf-8')), media_type="application/json")
        elif outputType == "csv":
            # Reconstruct to CSV and output file 
            csv_output = io.StringIO()  
            csvwriter = csv.writer(csv_output) 

            headers = [item['header'] for item in structured_data]  
            csvwriter.writerow(headers)  

            responses = [item['response'] for item in structured_data]  
            csvwriter.writerow(responses)  

            sources = [item['source'] for item in structured_data]  
            csvwriter.writerow(sources)

            csv_output.seek(0)  
            return StreamingResponse(csv_output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=result.csv"})
        elif outputType == "text":
            # Format as plain text
            text_output = io.StringIO()
            text_output.write("Analysis Results\n\n")
            
            for item in structured_data:
                text_output.write(f"Header: {item['header']}\n")
                text_output.write(f"Prompt: {item['prompt']}\n")
                text_output.write(f"Response: {item['response']}\n")
                text_output.write(f"Source: {item['source']}\n\n")
            
            text_output.seek(0)
            return StreamingResponse(text_output, media_type="text/plain", headers={"Content-Disposition": "attachment; filename=result.txt"})
        else:   
            # Return a JSON error response  
            return JSONResponse(  
                status_code=400,  
                content={"error": "Invalid outputType provided. Valid options are 'json', 'csv', or 'text'."}  
            )
    except Exception as e:
        print(f"Error in pdf_csv_analyzer: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"error": f"An error occurred: {str(e)}"}
        )

'''
    Takes in a dictionary containing openAI responces and structures it into a JSON object.
    
    Parameters:
        - responces (dict): A dictionary with triples as values.
    Return Value:
        - object: A object respresenting a JSON with header, prompt, response, and source for a given OpenAI extraction.
'''
def convert_responces_to_json(responces):
    renamed_list = [  
        {
            'header': key,
            'prompt': value[0],
            'response': value[1],
            'source': value[2]
        }     
        for key, value in responces.items()  
    ]  
    
    return renamed_list