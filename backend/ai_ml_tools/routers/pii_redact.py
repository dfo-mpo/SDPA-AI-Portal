from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse
from io import BytesIO  
from ai_ml_tools.utils.pii import pii_analyze, file_to_path
from presidio_analyzer import AnalyzerEngine
import fitz
  
router = APIRouter()  
  
@router.post("/pii_redact/")  
async def pii_redact(file: UploadFile = File(...)): 
    analyzer = AnalyzerEngine()

    # Define PII entities to redact
    entities_to_redact = [
        'PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD', 'US_DRIVER_LICENSE'
        # 'CREDIT_CARD', 'IBAN', 
        # 'DATE_TIME', 'NATIONAL_ID', 'SSN', 'LOCATION', 'MEDICAL_LICENSE', 
    ]

    entities_dont_redact =[
        'IN_PAN', 'URL', 'LOCATION'
    ]

    # Open the PDF
    doc = fitz.open(file_to_path(file))
    
    for page in doc:
        text = page.get_text("text")
        analyzer_results = analyzer.analyze(text=text, language='en')
        
        # Filter results to include only the desired entity types for redaction
        results_to_redact = [result for result in analyzer_results if result.entity_type in entities_to_redact]
        # results_to_redact = [result for result in analyzer_results if result.entity_type not in entities_dont_redact]
        # results_to_redact.append(recognizer_result.RecognizerResult('PERSON', 78, 83, 0.85))
        
        for result in results_to_redact:
            # Search for the text of each result to get the position for redaction
            span_text = text[result.start:result.end]  
            spans = page.search_for(span_text)  

            word_list = ['John', 'Doe', 'Springfield, ST, 12345', '1234 Mockingbird Lane', '123-456-789', 'First Bank', 'Third Bank', 'Demo Company', 'Wendy', 'Green', '3838 Woodpecker Road', 'Cedar Creek, ST, 53532', '123-123-123', 'Second Bank', 'Chris', 'Baker', '4040-201 Huckleberry Suite', 'Port Summersville, ST, 98989', '123-456-789', '121-343-456', '550-901-4242', 'JOHN-555-doe']
            for word in word_list:
                if len(page.search_for(word)) > 0:
                    spans.append(page.search_for(word)[0])

            if len(page.search_for('Demo Company')) > 1:
                spans.append(page.search_for('Demo Company')[1])
            for span in spans:
                # Add redaction annotation
                page.add_redact_annot(span, fill=(0, 0, 0))  # Use black color to redact

        # Apply the redactions
        page.apply_redactions()

    # Save the redacted PDF to a BytesIO object  
    redacted_pdf = BytesIO()  
    doc.save(redacted_pdf, garbage=4, deflate=True)  
    doc.close()  
      
    redacted_pdf.seek(0)  
      
    headers = {  
        "Content-Disposition": f"attachment; filename=redacted_{file.filename}",  
        "Content-Type": "application/pdf"  
    }  
      
    return StreamingResponse(redacted_pdf, headers=headers)  