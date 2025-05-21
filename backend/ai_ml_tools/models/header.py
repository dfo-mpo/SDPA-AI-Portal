'''
Defines class for Header which contains header_name, prompt, and functions to add document content to prompt.
'''

class Header:
    def __init__(self, header_name, prompt):
        self._name = header_name
        self._csv_prompt = prompt  # added so that prompt added in csv can be in json output
        self._prompt = prompt

    '''
    Adding document content to the header's current prompt
    Parameters:
        - doc_content (str): The content of the document to be added to the prompt.
    '''
    def add_doc_content_to_prompt(self, doc_content):
        self._prompt = "Read the following document:" + doc_content + '\n\n' + 'User: ' + self._csv_prompt + '\n'

    @property
    def name(self):
        return self._name

    @property
    def prompt(self):
        return self._prompt
    
    @property
    def csv_prompt(self):
        return self._csv_prompt