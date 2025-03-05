'''
Class defining a document that is used by OpenAI. It contains the following properties: file_path, file_name, content, col_prompts, and openai_answers.
There are also serveral functions defined in this class which are listed below.
'''
class Document:
    def __init__(self, file_path: str, col_prompts: list):
        self._file_path = file_path
        self._file_name = self.get_file_name(file_path)
        self._content = self.get_content(file_path)
        self._col_prompts = col_prompts
        self._openai_answers = {}

    '''
    Purpose: Extract the filename from the given file path and return it as a string.
    Parameters:
      - path (str): The complete file path from which the filename is to be extracted.
    Return Value:
      - file_name (str): The extracted filename as a string.
    '''
    def get_file_name(self, path) -> str:
        file_name = path.split("/")[-1]
        return file_name
    
    '''
    Read the content of a text document located at the specified path and return it as a string.
    Parameters:
      - path (str): File path to the text document that needs to be read.
    Return Value:
      - doc_content (str): Content of the file as a string
    '''
    def get_content(self, path) -> str:
        # First check if JSON already exits
        file_name_json = self._file_name[:-4] + ".json"
        jd_json_path = os.path.join(json_path + f'jsondata/{folder}', f'{file_name_json}')
        jsondata_exists = os.path.exists(jd_json_path)

        # If JSON already exists and overwrite is turned off, then read from JSON
        if not jsondata_exists or overwrite: 
            client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

            try:
                with open(path, 'rb') as f:
                    poller = client.begin_analyze_document("prebuilt-document", document=f)
                    result = poller.result()

                    refine_content_toJSON(result, self._file_name)
            except Exception as e:
                print(f"Error processing document: {e}")
        
        # If JSON data is too large, use string for raw content instead
        refined_content = json.dumps(create_object_from_dict(jd_json_path), indent=4)
        # encoding = tiktoken.get_encoding("cl100k_base")
        # num_tokens = len(encoding.encode(refined_content))
        # print('Using json data' if num_tokens < token_threshold else 'Using content string')

        return refined_content
    
    '''
    Obtain responses from OpenAI based on conversation headers and return them in a dictionary.
    Return Value:
        - _openai_answers (dict): A dictionary containing OpenAI responses, where header names serve as keys and 
        corresponding conversation responses as values. Each response is stored under the 'content' key of a 
        conversation item in a list. 
    '''
    def get_openai_responses(self) -> dict:
        content = (
            """ You are an AI assistant that reads in a document and answers user questions related to it. The document is provided here:
        ---
        DOCUMENT
            """
            + self._content
            + """
        ---
        SPECIFICATIONS
        Only use information found in the document to answer questions.
        If you cannot find the information being prompted to answer, respond with NA.
        When specified to return a list, separate list elements using the comma symbol “,” as a delimiter.
        If “Fisheries and Oceans Canada” is part of your response, condense to “DFO”.
        For each prompt, return exactly what is asked.
        DO NOT output extra unnecessary words.
        IF an output structure is specified, follow that structure EXACTLY, your only limitation is that you can only provide the “A:” portion, not the “Q:” portion.
        At the end of each non N/A response add a source, format MUST be "Source: <The Document Title>, Page: <page number>, 
        Paragraph Number: <paragraph number> (the ith entry in "Paragraphs": [] starting at 1, N/A if from Tables), 
        Table Number: <table number> (the ith entry in "Paragraphs": [] starting at 1, N/A if from Paragraphs),
        Section Heading: <section heading>"
        If responce contains multiple sources COMBINE them into a single entry.
        DO NOT break any of the rules above.
        """
        )
        # Alternative prompt method, critical for GPT4 instead of GPT4 turbo
        # There will be """ + str(len(self._col_prompts)) + """ user inputs and therefore """ + str(len(self._col_prompts)) + """ answers expected.
        # You will receive 7 or 8 tasks, in a single response, you will answer all these questions separated by 'A:'.

        conversation = [{'role': "system", "content": content}]
        responses = []
        token_consumption = 0

        for header in self._col_prompts:
            # Get response for current prompt
            response = None
            try:
                response = request_openai_response(header.prompt, conversation)
            except RateLimitError as e:  
                # Extract the 'Retry-After' header value or use a default wait time  
                retry_after = int(e.headers.get('Retry-After', 30))  
                print(f'Rate limit exceeded. Retrying after {retry_after} seconds.')  
                time.sleep(retry_after+1)  # Wait an extra second incase error message rounded down to nearest second
                response = request_openai_response(header.prompt, conversation) 
            except Exception as e:  
                print(f"An OpenAIError occurred: {e}")  
                raise

            if response:
                conversation = response[0]
                responses.append(response[1][3:] if response[1].startswith('A: ') else response[1])  
                token_consumption += int(response[2])
        print('(Tokens consumed: {0})\n'.format(token_consumption))
        
        # Separate response and source
        i = 0
        for header in self.col_prompts:
            parts = responses[i].split('Source:', 1)  
            self._openai_answers[header.name] = (header.csv_prompt, parts[0].strip(), parts[1].strip() if len(parts) > 1 else "N/A")
            i += 1
        return self._openai_answers, token_consumption

    @property
    def col_prompts(self):
        return self._col_prompts

    @property
    def file_name(self):
        return self._file_name