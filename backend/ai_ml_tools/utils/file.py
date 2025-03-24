from ai_ml_tools.models.header import Header
from io import BytesIO
from PIL import Image
import fitz
import re
import csv

# Converts file passed from front end into a file loaded in memory
async def file_to_path(file):
    contents = await file.read()  
    return BytesIO(contents)

# Converts file to a png, currently supports tiff to png
async def file_to_png(file, png_name, type='tiff'):
    # Create image object
    image = Image.open(file)     

    # Convert image to PNG  
    png_image_io = BytesIO()  
    image.save(png_image_io, format='PNG')  
    png_image_io.seek(0)

    # Store the PNG image in memory, block below may be useful in the future but uncommenting it will break the age_scale API
    # png_file_path = f"{pdf_name}.png"  
   
    # with open(png_file_path, "wb") as f:  
    #     f.write(png_image_io.getbuffer())
    
    # return png_file_path
    return png_image_io

def pdf_to_text(file):
    try:  
        # Open the PDF file  
        document = fitz.open(stream=file, filetype="pdf")  
          
        # Initialize a variable to store the extracted text  
        text = ""  
  
        # Iterate over each page and extract text  
        for page_num in range(len(document)):  
            page = document.load_page(page_num)  
            text += page.get_text()  
  
        # Close the document  
        document.close()  

        return re.sub(r'\s+', ' ', text) 
  
    except Exception as e:  
        print(f"Error processing document: {e}")  
        return None  
    
"""
    Extract and create Header objects from a CSV file.

   Opens the specified CSV file, reads its content, and extracts pairs of column headers and prompts.
   Each pair is used to create a Header object, and a list of Header objects is returned.

   Return Value:
       - header_list (list of Header): A list of Header objects containing extracted column headers and prompts.
"""
#### **** UNCOMMENT THIS BLOCK WHEN DONE WITH MOCKING **** ####

# def extract_col_prompts(file): 
#     if hasattr(file, 'file'):
#         content = file.file.read()
#         from io import StringIO
#         file_content = StringIO(content.decode('cp1252'))  
#         reader = csv.reader(file_content)
#     else:
#         # For file paths (strings) - original functionality
#         with open(file, encoding='cp1252') as file:
#             reader = csv.reader(file)
#     # Using CSV, extract prompts
    
#     headers = next(reader, None)  # Read the first row, which contains the headers  
#     prompts = next(reader, None)  # Read the second row, which contains the prompts  
  
#     if not headers or not prompts:  
#         return None  
  
#     # Pair each header with its corresponding prompt  
#     header_list = [Header(header, prompt) for header, prompt in zip(headers, prompts)]  
#     return header_list 

def extract_col_prompts(file):
    try:
        # Handle UploadFile objects
        if hasattr(file, 'file'):
            # For FastAPI UploadFile objects
            content = file.file.read()
            from io import StringIO
            csv_file = StringIO(content.decode('utf-8', errors='replace'))
            reader = csv.reader(csv_file)
        else:
            # For file paths (strings)
            with open(file, encoding='cp1252') as f:
                reader = csv.reader(f)
        
        headers = next(reader, None)  # Read the first row
        prompts = next(reader, None)  # Read the second row
        
        # Mock headers and prompts if none were found
        if not headers or not prompts:
            headers = ["Column1", "Column2", "Column3"]
            prompts = ["What is Column1?", "What is Column2?", "What is Column3?"]
        
        # Pair each header with its corresponding prompt
        header_list = [Header(header, prompt) for header, prompt in zip(headers, prompts)]
        return header_list
    except Exception as e:
        print(f"Error extracting CSV prompts: {e}")
        # Return mock headers as fallback
        header_list = [
            Header("MockColumn1", "What is in MockColumn1?"),
            Header("MockColumn2", "What is in MockColumn2?")
        ]
        return header_list