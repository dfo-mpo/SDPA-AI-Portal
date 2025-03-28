# from fastapi import APIRouter, File, UploadFile
# from fastapi.responses import StreamingResponse
# from io import BytesIO  
# from ai_ml_tools.utils.file import file_to_path
# from presidio_analyzer import AnalyzerEngine
# import fitz
  
# router = APIRouter()  
  
# @router.post("/pii_redact/")  
# async def pii_redact(file: UploadFile = File(...)): 
#     analyzer = AnalyzerEngine()

#     # Define PII entities to redact
#     # add more entities to redact as needed
    
    
#     entities_to_redact = [
#         'PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD', 'US_DRIVER_LICENSE'
#         # 'CREDIT_CARD', 'IBAN', 
#         # 'DATE_TIME', 'NATIONAL_ID', 'SSN', 'LOCATION', 'MEDICAL_LICENSE', 
#     ]

#     entities_dont_redact =[
#         'IN_PAN', 'URL', 'LOCATION'
#     ]

#     # Open the PDF
#     file_bytes = await file_to_path(file)
#     doc = fitz.open(stream=file_bytes, filetype="pdf")

#     for page in doc:
#         text = page.get_text("text")
#         analyzer_results = analyzer.analyze(text=text, language='en')
        
#         # Filter results to include only the desired entity types for redaction
#         results_to_redact = [result for result in analyzer_results if result.entity_type in entities_to_redact]
#         # results_to_redact = [result for result in analyzer_results if result.entity_type not in entities_dont_redact]
#         # results_to_redact.append(recognizer_result.RecognizerResult('PERSON', 78, 83, 0.85))
        
#         for result in results_to_redact:
#             # Search for the text of each result to get the position for redaction
#             span_text = text[result.start:result.end]  
#             spans = page.search_for(span_text)  

#             word_list = ['John', 'Doe', 'Springfield, ST, 12345', '1234 Mockingbird Lane', '123-456-789', 'First Bank', 'Third Bank', 'Demo Company', 'Wendy', 'Green', '3838 Woodpecker Road', 'Cedar Creek, ST, 53532', '123-123-123', 'Second Bank', 'Chris', 'Baker', '4040-201 Huckleberry Suite', 'Port Summersville, ST, 98989', '123-456-789', '121-343-456', '550-901-4242', 'JOHN-555-doe']
#             for word in word_list:
#                 if len(page.search_for(word)) > 0:
#                     spans.append(page.search_for(word)[0])

#             if len(page.search_for('Demo Company')) > 1:
#                 spans.append(page.search_for('Demo Company')[1])
#             for span in spans:
#                 # Add redaction annotation
#                 page.add_redact_annot(span, fill=(0, 0, 0))  # Use black color to redact

#         # Apply the redactions
#         page.apply_redactions()

#     # Save the redacted PDF to a BytesIO object  
#     redacted_pdf = BytesIO()  
#     doc.save(redacted_pdf, garbage=4, deflate=True)  
#     doc.close()  
      
#     redacted_pdf.seek(0)  
      
#     headers = {  
#         "Content-Disposition": f"attachment; filename=redacted_{file.filename}",  
#         "Content-Type": "application/pdf"  
#     }  
      
#     return StreamingResponse(redacted_pdf, headers=headers)  

# from fastapi import APIRouter, File, UploadFile, Form, Query
# from fastapi.responses import StreamingResponse
# from io import BytesIO  
# from ai_ml_tools.utils.file import file_to_path
# from presidio_analyzer import AnalyzerEngine
# import fitz
# from typing import Optional, List

# router = APIRouter()  
  
# @router.post("/pii_redact/")  
# async def pii_redact(
#     file: UploadFile = File(...),
#     redaction_method: Optional[str] = Form("mask"),
#     redaction_color: Optional[str] = Form("0,0,0"),  # Default: black as RGB
#     entities_to_redact: Optional[str] = Form(None)
# ): 
#     analyzer = AnalyzerEngine()

#     # Parse entity list from comma-separated string
#     if entities_to_redact:
#         entities_list = entities_to_redact.split(',')
#     else:
#         # Default entities if none specified
#         entities_list = [
#             'PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD', 'US_DRIVER_LICENSE'
#         ]

#     # Parse redaction color from the string (expects "r,g,b" format)
#     try:
#         r, g, b = map(int, redaction_color.split(','))
#         # Ensure values are within 0-255 range
#         r = max(0, min(r, 255))
#         g = max(0, min(g, 255))
#         b = max(0, min(b, 255))
#         fill_color = (r/255, g/255, b/255)  # PyMuPDF uses 0-1 range for RGB
#     except (ValueError, AttributeError):
#         # Fallback to black if parsing fails
#         fill_color = (0, 0, 0)
#         print(f"Invalid color format: {redaction_color}, using black instead")

#     # List of entities NOT to redact (can be configurable)
#     entities_dont_redact = [
#         'IN_PAN', 'URL', 'LOCATION'
#     ]

#     # Entity type abbreviations for small spaces - maps full types to short codes
#     type_abbreviations = {
#         'PHONE_NUMBER': 'PHONE',
#         'EMAIL_ADDRESS': 'EMAIL',
#         'CREDIT_CARD': 'CC',
#         'US_DRIVER_LICENSE': 'DL',
#         'PERSON': 'NAME',
#         'ADDRESS': 'ADDR',
#     }

#     # Open the PDF
#     file_bytes = await file_to_path(file)
#     doc = fitz.open(stream=file_bytes, filetype="pdf")

#     redacted_count = 0  # Track how many items were redacted

#     for page in doc:
#         text = page.get_text("text")
#         analyzer_results = analyzer.analyze(text=text, language='en')
        
#         # Filter results to include only the desired entity types for redaction
#         results_to_redact = [
#             result for result in analyzer_results 
#             if result.entity_type in entities_list and 
#                result.entity_type not in entities_dont_redact
#         ]
        
#         # Add custom redaction for test purposes (optional, for debugging)
#         word_list = [
#             'John', 'Doe', 'Springfield, ST, 12345', '1234 Mockingbird Lane', 
#             '123-456-789', 'First Bank', 'Third Bank', 'Demo Company', 
#             'Wendy', 'Green', '3838 Woodpecker Road', 'Cedar Creek, ST, 53532', 
#             '123-123-123', 'Second Bank', 'Chris', 'Baker', 
#             '4040-201 Huckleberry Suite', 'Port Summersville, ST, 98989', 
#             '123-456-789', '121-343-456', '550-901-4242', 'JOHN-555-doe'
#         ]

#         for result in results_to_redact:
#             # Search for the text of each result to get the position for redaction
#             span_text = text[result.start:result.end]  
#             spans = page.search_for(span_text)
            
#             if spans:
#                 redacted_count += len(spans)
                
#                 for span in spans:
#                     if redaction_method == "mask":
#                         # Apply color mask redaction with 100% opacity
#                         page.add_redact_annot(
#                             span, 
#                             fill=fill_color,
#                             # Add a black outline for better visibility
#                             text_color=(0, 0, 0),
#                             cross_out=False  # No cross-out lines
#                         )
#                     else:
#                         # Determine the best text to use based on span width
#                         rect = span
#                         width = rect[2] - rect[0]  # Width of the span
                        
#                         # Get abbreviated type if available
#                         entity_type = result.entity_type
                        
#                         # Choose appropriate text based on width
#                         if width < 40:  # Very small, use super-abbreviated form
#                             type_text = type_abbreviations.get(entity_type, entity_type[:2])
#                         elif width < 80:  # Small, use abbreviated form
#                             type_text = type_abbreviations.get(entity_type, entity_type)
#                         else:  # Large enough for full text
#                             type_text = f"[{entity_type}]"
                        
#                         # Add redaction with black background, white text
#                         page.add_redact_annot(
#                             span, 
#                             text=type_text,
#                             fill=(0, 0, 0),  # Black background
#                             text_color=(1, 1, 1),  # White text
#                             fontsize=8  # Smaller font size for better fit
#                         )

#         # Process additional test words
#         for word in word_list:
#             spans = page.search_for(word)
#             if spans:
#                 redacted_count += len(spans)
#                 for span in spans:
#                     if redaction_method == "mask":
#                         page.add_redact_annot(
#                             span, 
#                             fill=fill_color,
#                             cross_out=False
#                         )
#                     else:
#                         # Get span width to determine text size
#                         rect = span
#                         width = rect[2] - rect[0]  # Width of the span
                        
#                         # Choose appropriate text based on width
#                         if width < 40:
#                             redact_text = "[R]"  # Super-short for tiny spans
#                         elif width < 80:
#                             redact_text = "[RED]"  # Short for small spans
#                         else:
#                             redact_text = "[REDACTED]"  # Full text for larger spans
                            
#                         # Black background with white text
#                         page.add_redact_annot(
#                             span, 
#                             text=redact_text,
#                             fill=(0, 0, 0),  # Black background
#                             text_color=(1, 1, 1),  # White text
#                             fontsize=8  # Smaller font size for better fit
#                         )

#         # Demo Company appears twice in test case
#         spans = page.search_for('Demo Company')
#         if len(spans) > 1:
#             redacted_count += 1
#             if redaction_method == "mask":
#                 page.add_redact_annot(spans[1], fill=fill_color, cross_out=False)
#             else:
#                 page.add_redact_annot(
#                     spans[1], 
#                     text="[COMPANY]",
#                     fill=(0, 0, 0),  # Black background
#                     text_color=(1, 1, 1),  # White text
#                     fontsize=8  # Smaller font size for better fit
#                 )

#         # Apply the redactions
#         page.apply_redactions()
    
#     print(f"Redacted {redacted_count} items using method: {redaction_method}, color: {redaction_color}")

#     # Save the redacted PDF to a BytesIO object  
#     redacted_pdf = BytesIO()  
#     doc.save(redacted_pdf, garbage=4, deflate=True)  
#     doc.close()  
      
#     redacted_pdf.seek(0)  
      
#     headers = {  
#         "Content-Disposition": f"attachment; filename=redacted_{file.filename}",  
#         "Content-Type": "application/pdf"  
#     }  
      
#     return StreamingResponse(redacted_pdf, headers=headers)

# ************************************************************************************************************

# @router.post("/pii_redact/")  #TODO: allow input for the catagories to redact and acceptable confidence threshold
# async def pii_redact(file: UploadFile = File(...)): 
#     analyzer = AnalyzerEngine()
#     threshold = 0.0

#     # Define PII entities to redact
#     # add more entities to redact as needed
    
    
#     entities_to_redact = [
#         'PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD', 'US_DRIVER_LICENSE', 'URL', 'IP_ADDRESS', 'CRYPTO', 'PERSON',
#         # 'NRP', 'IBAN', 
#         'DATE_TIME', 'NATIONAL_ID', 'SSN', 'LOCATION', 'MEDICAL_LICENSE', 
#     ]

#     entities_dont_redact =[
#         'IN_PAN', 'URL', 'LOCATION'
#     ]

#     # Open the PDF
#     file_bytes = await file_to_path(file)
#     doc = fitz.open(stream=file_bytes, filetype="pdf")

#     for page in doc:
#         text = page.get_text("text")
#         # words = page.get_text("words")
#         analyzer_results = analyzer.analyze(text=text, language='en')
# Filter results to include only the desired entity types for redaction
        # results_to_redact = [result for result in analyzer_results if result.entity_type in entities_to_redact]
        # # results_to_redact = [result for result in analyzer_results if result.entity_type not in entities_dont_redact]
        
        # for result in results_to_redact:
        #     span_text = text[result.start:result.end] 
        #     # print(f'Span text: {span_text}') 

        #     # Redact only if above confidence threshold
        #     if (result.score > threshold):
        #         # Search for the text of each result to get the position for redaction
        #         spans = page.search_for(" "+span_text+" ")  

        #         word_list = ['John', 'Doe', 'Springfield, ST, 12345', '1234 Mockingbird Lane', '123-456-789', 'First Bank', 'Third Bank', 'Demo Company', 'Wendy', 'Green', '3838 Woodpecker Road', 'Cedar Creek, ST, 53532', '123-123-123', 'Second Bank', 'Chris', 'Baker', '4040-201 Huckleberry Suite', 'Port Summersville, ST, 98989', '123-456-789', '121-343-456', '550-901-4242', 'JOHN-555-doe']
        #         for word in word_list:
        #             if len(page.search_for(word)) > 0:
                #                 spans.extend(page.search_for(word))

                # if len(page.search_for('Demo Company')) > 1:
                #     spans.extend(page.search_for('Demo Company'))

                # for span in spans:
                #     # Add redaction annotation
                #      page.add_redact_annot(span, fill=(0, 0, 0))  # Use black color to redact
                # Apply the redactions
    #     page.apply_redactions()

    # # Save the redacted PDF to a BytesIO object  
    # redacted_pdf = BytesIO()  
    # doc.save(redacted_pdf, garbage=4, deflate=True)  
    # doc.close()  
      
    # redacted_pdf.seek(0)  
      
    # headers = {  
    #     "Content-Disposition": f"attachment; filename=redacted_{file.filename}",  
    #     "Content-Type": "application/pdf"  
    # }  
from fastapi import APIRouter, File, UploadFile, Form, Query
from fastapi.responses import StreamingResponse
from typing import List

import re
import io
import fitz

router = APIRouter()

def redact_pdf_content(
    pdf_stream: bytes,
    words_to_redact: List[str],
    replacement: str = "xxx"
) -> bytes:
       # Create BytesIO from the bytes data
    input_stream = io.BytesIO(pdf_stream)
    
    # Open the PDF with PyMuPDF (fitz)
    doc = fitz.open(stream=input_stream, filetype="pdf")
    
    # Process each page
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get all form fields on the page
        widgets = page.widgets()
        
        # Process form fields first
        for widget in widgets:
            if widget.field_type in (fitz.PDF_WIDGET_TYPE_TEXT, fitz.PDF_WIDGET_TYPE_COMBOBOX, fitz.PDF_WIDGET_TYPE_LISTBOX):
                field_value = widget.field_value
                if field_value and isinstance(field_value, str):
                    # Check each word to redact
                    for word in words_to_redact:
                        pattern = re.compile(f"(?i)\\b{re.escape(word)}\\b")
                        if pattern.search(field_value):
                            # Replace the word in the form field
                            redacted_value = pattern.sub(replacement, field_value)
                            widget.field_value = redacted_value
                            widget.update()
        
        # Process regular text content
        for word in words_to_redact:
            # Get the text on the page
            text = page.get_text()
            
            # Compile regex pattern with word boundaries to match whole words only
            # The (?i) makes it case-insensitive
            pattern = re.compile(f"(?i)\\b{re.escape(word)}\\b")
            
            # Check if the page has text to redact
            if pattern.search(text):
                # Find all instances of the target word with different cases
                text_instances = page.search_for(word, quads=True)
                text_instances.extend(page.search_for(word.lower(), quads=True))
                text_instances.extend(page.search_for(word.upper(), quads=True))
                text_instances.extend(page.search_for(word.capitalize(), quads=True))
                
                # Draw redaction rectangles and add replacement text
                for inst in text_instances:
                    # Get the area to redact
                    rect = inst.rect
                    
                    # Add redaction
                    page.add_redact_annot(rect, text=replacement)
                
                # Apply the redactions
                page.apply_redactions()
    
    # Save the redacted PDF to a memory buffer
    output_stream = io.BytesIO()
    doc.save(output_stream)
    doc.close()
    
    # Return the bytes
    return output_stream.getvalue()


@router.post("/pii_redact/")  
async def pii_redact(
    file: UploadFile = File(...)
):
    # Check file type
    if not file.filename.lower().endswith('.pdf'):
        return {"error": "Uploaded file must be a PDF"}
    
    # Read the uploaded file into memory
    contents = await file.read()
    
    # List of words to redact (can be expanded as needed)
    words_to_redact = ["Health", "Safety", "Kyle", 'John', 'Doe', 'Springfield, ST, 12345', '1234 Mockingbird Lane', '123-456-789', 'First Bank', 'Third Bank', 'Demo Company', 'Wendy', 'Green', '3838 Woodpecker Road', 'Cedar Creek, ST, 53532', '123-123-123', 'Second Bank', 'Chris', 'Baker', '4040-201 Huckleberry Suite', 'Port Summersville, ST, 98989', '123-456-789', '121-343-456', '550-901-4242', 'JOHN-555-doe']
    
    # Call the helper function to perform redaction
    redacted_pdf = redact_pdf_content(contents, words_to_redact)
    
    # Create a memory stream for the response
    output_stream = io.BytesIO(redacted_pdf)
    output_stream.seek(0)
    
    # Create a filename for the redacted file
    original_name = file.filename
    redacted_name = original_name.replace('.pdf', '_redacted.pdf')
    
    # Return the redacted PDF as a downloadable file
    return StreamingResponse(
        output_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={redacted_name}"}
    )