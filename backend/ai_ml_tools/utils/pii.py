from presidio_analyzer import AnalyzerEngine
from pdfminer.high_level import extract_text
from io import BytesIO  

async def pii_analyze(pdf_path):
    analyzer = AnalyzerEngine()

    text = extract_text(pdf_path) 
    return analyzer.analyze(text=text, language='en')

async def file_to_path(file):
    contents = await file.read()  
    return BytesIO(contents) 