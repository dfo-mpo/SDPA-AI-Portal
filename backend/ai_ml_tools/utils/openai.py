from openai import AzureOpenAI
from langchain_openai import AzureOpenAIEmbeddings
from langchain_core.documents import Document
from langchain_chroma import Chroma
from dotenv import load_dotenv
from uuid import uuid4
import tiktoken
import chromadb
import json
import os

# Configure OpenAI settings
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
openAIClient_o3_mini = AzureOpenAI(
  azure_endpoint = os.getenv('OPENAI_API_ENDPOINT_US'), 
  api_key = os.getenv('OPENAI_API_KEY_US'),  
  api_version = os.getenv('OPENAI_API_o3-mini_VERSION')
)
openAIClient_4o = AzureOpenAI(
  azure_endpoint = os.getenv('OPENAI_API_ENDPOINT'), 
  api_key = os.getenv('OPENAI_API_KEY'),  
  api_version = os.getenv('OPENAI_API_4o_VERSION')
)
openAIClient_4o_mini = AzureOpenAI(
  azure_endpoint = os.getenv('OPENAI_API_ENDPOINT'), 
  api_key = os.getenv('OPENAI_API_KEY'),  
  api_version = os.getenv('OPENAI_API_4o-mini_VERSION')
)

# Configure embeddings for RAG
embeddings = AzureOpenAIEmbeddings(
    model="text-embedding-3-large",
    azure_endpoint = os.getenv('OPENAI_API_EMBEDDING_ENDPOINT'), 
    api_key = os.getenv('OPENAI_API_KEY'),
    openai_api_version = os.getenv('OPENAI_API_EMBEDDING_VERSION')
)

'''
Determines the amount of tokens for OpenAI's newer models a given string will consume.
'''
def num_tokens_from_string(string) -> int:
    encoding = tiktoken.get_encoding('cl100k_base')
    num_tokens = len(encoding.encode(string))
    return num_tokens

"""
Streams responses from OpenAI for the chat view. 

- Formats the chat history and document content for the OpenAI API.
- Sends the formatted data to OpenAI and yields responses as they are received.
- Handles exceptions and yields error messages if necessary.
"""
def request_openai_chat(chat_history: list, document_content: str, type="chat", model="gpt-4o", tempurature=0.3, reasoning_effort="high"):
    if type == "chat":
        # Only generate system message if it does not already exist
        if chat_history[0]['role'] != "system":
            messages = [{
                "role": "system","content": "You are a helpful assistant that ALWAYS responds in consistent and pleasing HTML formatted text. Also, make sure to use borders ONLY IF you use a table in your response. Only answer the LAST QUESTION based on the document provided. Do not answer any questions not related to the document or PDF. Also, at the end of the entire total response tell me what pages you found the information on separated by commas. For example, at the end include: Source_page: <page-number1, page-number2, etc>." + document_content
            }]
        else:
            messages = []
    else:
        messages = [{
            "role": "system","content": "You are a helpful assistant that ALWAYS responds in consistent and pleasing HTML formatted text. Also, make sure to use borders ONLY IF you use a table in your response. Only answer the LAST QUESTION based on the document provided. Do not answer any questions not related to the document or PDF. Also, at the end of the entire total response tell me what documents and pages you found the information on separated by commas ONLY. For example, at the end include: Source_page: <document-name1.pdf, 1, 4, etc, document-name2.pdf, 2, 5, etc,>." + document_content
        }]
    messages.extend(chat_history)
    new_message_string = json.dumps(messages)
    tokens_used = num_tokens_from_string(new_message_string)
    # print(messages)
    
    print(f"Input tokens: {tokens_used}")
    try:
        if model == "gpt-4o":
            stream = openAIClient_4o.chat.completions.create(
                model=model,
                messages=messages,
                temperature=tempurature,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=True
            )
        elif model == "gpt-4o-mini":
            stream = openAIClient_4o_mini.chat.completions.create(
                model=model,
                messages=messages,
                temperature=tempurature,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=True
            )
        elif model == "o3-mini":
            stream = openAIClient_o3_mini.chat.completions.create(
                model=model,
                messages=messages,
                reasoning_effort=reasoning_effort,
                stop=None,
                stream=True
            )
        else:
            raise ValueError(f"{model} is not a supported model name.")
        
        for response in stream:
            content = response.choices[0].delta.content if len(response.choices) > 0 else []
            finish_reason = response.choices[0].finish_reason if len(response.choices) > 0 else None
            data = json.dumps({'content': content, 'finish_reason': finish_reason,'tokens_used': tokens_used})
            yield f"data: {data}\n\n"

    except Exception as e:
        print(e)
        yield f"data: {{'error': 'Error fetching data from OpenAI: {str(e)}'}}\n\n"

"""
Obtain relevent document chunks for a given LLM chatbot question
"""
def get_relevent_chunks(chat_history: list[dict], document_chunks: list[str], document_metadata: list[dict]):
    # To fix caching issue resulting in not connecting to default tenant, https://github.com/langchain-ai/langchain/issues/26884
    chromadb.api.client.SharedSystemClient.clear_system_cache()

    document_content = ''

    # Convert the list of dictionaries back to Document objects  
    document_objects = [Document(id=index,page_content=chunk,metadata={"document_name": document_metadata[index]['document_name'], "page_number": document_metadata[index]["page_number"]},) for index, chunk in enumerate(document_chunks)]

    # Create vector store
    vector_store = Chroma("example_collection", embedding_function=embeddings)
    uuids = [str(uuid4()) for _ in range(len(document_objects))]
    vector_store.add_documents(documents=document_objects, ids=uuids)
    results = vector_store.similarity_search(chat_history[-1]['content'])

    for result in results:
        print(result)
        document_content += json.dumps(result.metadata, indent=4) 
        document_content += result.page_content
    
    return document_content

'''
Using OpenAI API, generate a response on the given document-based conversation.
Parameters:
    - question (str): The user's question or input.
    - conversation_input (list): List of dictionaries representing the conversation history, each containing 'role' 
    (user or model) and 'content' (message) keys.
Return Value:
    - List containing two elements:
        - conversation_input (list): Updated conversation history including the user's question and the model's response
        - total_tokens (int): Total tokens consumed during the conversation.
''' #TODO: add model name as input and have calls to 2 differnt functions, one does combined prompts while the other does segrigated
def request_openai_response(question, conversation_input, model="gpt-4o-mini", tempurature=0.3):
    conversation_input.append({"role": "user", "content": question})
    response = openAIClient_4o_mini.chat.completions.create(
        model=model,
        messages=conversation_input,
        temperature=tempurature,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)
    conversation_input.append(
        {
            "role": response.choices[0].message.role,
            "content": response.choices[0].message.content,
        }
    )
    
    # print(f'Responce: {response.choices[0].message.content.strip()}')
    api_usage = response['usage']
    # print('(Tokens consumed: {0})\n'.format(api_usage['total_tokens']))
    return [conversation_input, response.choices[0].message.content, api_usage["total_tokens"]]