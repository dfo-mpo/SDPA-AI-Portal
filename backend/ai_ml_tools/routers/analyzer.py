from fastapi import APIRouter, File, UploadFile
from ai_ml_tools.utils.file import extract_col_prompts
from ai_ml_tools.models.document import Document

router = APIRouter()  

# Takes in a pdf and returns the french translation
@router.post("/openai_csv_analyze/")
async def pdf_csv_analyzer(csv_file: UploadFile = File(...), pdf_file: UploadFile = File(...)):
    header_list = extract_col_prompts(csv_file)

    doc = Document(pdf_file, header_list)

    # Get OpenAI responces TODO: Finish converting databricks script for web app use
    # responses, tokens = doc.get_openai_responses()
    # structured_data = convert_responces_to_json(responses)
    # token_usage.append(tokens)

    # # Output resulting json file
    # structured_json = json.dumps(structured_data, indent=4)
    # if not os.path.exists(json_path + f"jsonresponces/{folder}/"):
    #     os.makedirs(json_path + f"jsonresponces/{folder}/")
    # output_path = os.path.join(json_path + f"jsonresponces/{folder}/", file[:-4] + ".json" )  
    # with open(output_path, 'w') as json_file:  
    #     json_file.write(structured_json)

    # # Reconstruct to CSV and output file 
    # with open(os.path.join(json_path + f"jsonresponces/{folder}/", file[:-4] + ".csv"), 'w', newline='') as csvfile:  
    #     csvwriter = csv.writer(csvfile)

    #     headers = [item['header'] for item in structured_data]  
    #     csvwriter.writerow(headers)  

    #     responses = [item['response'] for item in structured_data]  
    #     csvwriter.writerow(responses)  

    #     sources = [item['source'] for item in structured_data]  
    #     csvwriter.writerow(sources)  

    return {"temp": "temp"}