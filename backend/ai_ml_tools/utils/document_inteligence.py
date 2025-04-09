from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_core.documents import Document
from fastapi import UploadFile
from dotenv import load_dotenv
from typing import List
from io import BytesIO
import base64
import json
import os

# Load enviroment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Configure Azure Document Analysis settings
endpoint = os.getenv('DI_API_ENDPOINT')
key = os.getenv('DI_API_KEY')

"""
Extracts and refines the content of a document using Document Intelligence.

Steps:
- Initialize the client with endpoint and key.
- Open the file in binary mode and analyze the document.
- Extract the content and refine it using the 'refine_content' function.
- Handle exceptions and return the refined content.
"""
def get_content(pdf: UploadFile, content: bool, polygon: bool, di_api="3.1"):
    refined_content = None

    try:
        file_content =  pdf.file.read()
        # Open the file and analyze it.
        if di_api == "3.1":
            client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))
            poller = client.begin_analyze_document("prebuilt-document", document=file_content)
        elif di_api == "":
            client = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(key))
            base64_encoded_pdf = base64.b64encode(file_content).decode("utf-8")
            analyze_request = {"base64Source": base64_encoded_pdf}
            poller = client.begin_analyze_document("prebuilt-layout", analyze_request, output_content_format="markdown")
        else:
            raise TypeError(f"{di_api} is not a valid api value.")

        result = poller.result()
        refined_content = _di_object_to_json(result, di_api, content, polygon)
    except Exception as e:
        print(f"Error processing document: {e}")

    return refined_content

"""
Extracts a document and returns a list of document chunks in markdown.

Steps:
- Initialize the client with endpoint and key.
- Open the file in binary mode and analyze the document.
- Extract the content and refine it using the 'refine_content' function.
- Handle exceptions and return the refined content.
"""
def get_vectors(file: BytesIO, filename: str) -> List[Document]:
    # Initiate Azure AI Document Intelligence to load the document.
    content = ''
    document_intelligence_client = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(key))
    try:
        file.seek(0)
        base64_encoded_pdf = base64.b64encode(file.read()).decode("utf-8")

        analyze_request = {"base64Source": base64_encoded_pdf}
        poller = document_intelligence_client.begin_analyze_document(
            "prebuilt-layout", analyze_request, output_content_format="markdown"
        )
        result = poller.result()
        content = result.content
    except Exception as e:
        print(f"Error processing document: {e}")


    # Split the document into chunks base on markdown headers.
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    text_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    splits = text_splitter.split_text(content)

    # Create list of text chunks and list of metadata containing document name and page number for a given chunk
    text_chunks = []
    metadata = []
    for split in splits:
        text_chunks.append(split.page_content)
        metadata.append({'document_name': filename})

    print("Length of splits: " + str(len(splits)))
    return text_chunks, metadata

"""
Refines the content extracted from a document into a structured JSON format.

Steps:
- Iterate through paragraphs and tables in the document.
- For each, extract relevant details (content, page numbers, cell content, etc.).
- Convert the structured data into JSON format.
- Print and return the JSON string.
"""
def _di_object_to_json(result: object, di_api: str, content: bool, polygon: bool) -> str:
    refined_data = _json_with_polygons(result, di_api) if polygon else _json_no_polygons(result, di_api)

    if not content:
        del refined_data["Content"]

    # Convert the structured data into a formatted JSON string.
    refined_json = json.dumps(refined_data, indent=4)

    return refined_json

"""
Create a dictionary containing the content, paragraphs, and tables from a DI responce, polygons are omitted.
"""
def _json_no_polygons(result: object, di_api: str) -> dict:
    if di_api == "3.1":
        refined_data = {
            "Content": result.content,
            "Paragraphs": [
                {
                    "Role": paragraph.role,
                    "Content": paragraph.content,
                    "PageNumber": paragraph.bounding_regions[0].page_number if paragraph.bounding_regions else "N/A"
                    
                } 
                for paragraph in result.paragraphs
            ],
            "Tables": [
                {
                    "RowCount": table.row_count,
                    "ColumnCount": table.column_count,
                    "Cells": [{"RowIndex": cell.row_index, "ColumnIndex": cell.column_index, "Content": cell.content, "PageNumber": cell.bounding_regions[0].page_number if cell.bounding_regions else "N/A"} for cell in table.cells]
                } 
                for table in result.tables
            ]
        }
    elif di_api == "4.0":
        refined_data = {
            "Content": result.content,
            "Paragraphs": [
                {
                    "Id": paragraph_idx,
                    "Role": paragraph.role,
                    "Content": paragraph.content,
                    "PageNumber": paragraph.bounding_regions[0].page_number if paragraph.bounding_regions else "N/A"
                    
                }
                for paragraph_idx, paragraph in enumerate(result.paragraphs)
            ],
            "Tables": [
                {
                    "Id": table_idx,
                    "RowCount": table.row_count,
                    "ColumnCount": table.column_count,
                    "Cells": [{"RowIndex": cell.row_index, "ColumnIndex": cell.column_index, "Content": cell.content, "PageNumber": cell.bounding_regions[0].page_number if cell.bounding_regions else "N/A"} for cell in table.cells]
                } 
                for table_idx, table in enumerate(result.tables)
            ] if result.tables else [{"Id": "N/A", "RowCount": "N/A", "ColumnCount": "N/A", "Cells": [{"RowIndex": "N/A", "ColumnIndex": "N/A", "Content": "N/A", "PageNumber": "N/A"}]}] 
        }
    return refined_data

"""
Create a dictionary containing the content, paragraphs, and tables from a DI responce, polygons are included for each paragraph and table cell.
"""
def _json_with_polygons(result: object, di_api: str) -> dict:
    if di_api == "3.1":
        refined_data = {
            "Content": result.content,
            "Paragraphs": [
                {
                    "Role": paragraph.role,
                    "Content": paragraph.content,
                    "Polygon": [{f"x{i}": point.x, f"y{i}": point.y} for i, point in enumerate(paragraph.bounding_regions[0].polygon, start=1)],
                    "PageNumber": paragraph.bounding_regions[0].page_number if paragraph.bounding_regions else "N/A"
                    
                } 
                for paragraph in result.paragraphs
            ],
            "Tables": [
                {
                    "RowCount": table.row_count,
                    "ColumnCount": table.column_count,
                    "Cells": [{"RowIndex": cell.row_index, "ColumnIndex": cell.column_index, "Content": cell.content, "Polygon": [{f"x{i}": point.x, f"y{i}": point.y} for i, point in enumerate(cell.bounding_regions[0].polygon, start=1)], "PageNumber": cell.bounding_regions[0].page_number if cell.bounding_regions else "N/A"} for cell in table.cells]
                } 
                for table in result.tables
            ]
        }
    elif di_api == "4.0":
        refined_data = {
            "Content": result.content,
            "Paragraphs": [
                {
                    "Id": paragraph_idx,
                    "Role": paragraph.role,
                    "Content": paragraph.content,
                    "Polygon": [{f"point{i}": point} for i, point in enumerate(paragraph.bounding_regions[0].polygon, start=1)],
                    "PageNumber": paragraph.bounding_regions[0].page_number if paragraph.bounding_regions else "N/A"
                    
                }
                for paragraph_idx, paragraph in enumerate(result.paragraphs)
            ],
            "Tables": [
                {
                    "Id": table_idx,
                    "RowCount": table.row_count,
                    "ColumnCount": table.column_count,
                    "Cells": [{"RowIndex": cell.row_index, "ColumnIndex": cell.column_index, "Content": cell.content, "Polygon": [{f"point{i}": point} for i, point in enumerate(cell.bounding_regions[0].polygon, start=1)], "PageNumber": cell.bounding_regions[0].page_number if cell.bounding_regions else "N/A"} for cell in table.cells]
                } 
                for table_idx, table in enumerate(result.tables)
            ] if result.tables else [{"Id": "N/A", "RowCount": "N/A", "ColumnCount": "N/A", "Cells": [{"RowIndex": "N/A", "ColumnIndex": "N/A", "Content": "N/A", "Polygon": [], "PageNumber": "N/A"}]}] 
        }
    return refined_data