import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import AzureChatOpenAI
from utils.azure_key_vault import get_OPENAI_API_KEY

# Template for prompt
_MAP_PROMPT = ChatPromptTemplate.from_template(
    "You are extracting data from the following text chunk:\n"
    "{dom_content}\n\n"
    "Instruction: {parse_description}\n"
    "Rules:\n"
    "1) Only extract info that directly matches the instruction\n"
    "2) No extra commentary\n"
    "3) If nothing matches, return '' (empty)\n"
    "4) Output ONLY the requested data"
)

_REDUCE_PROMPT = ChatPromptTemplate.from_template(
    "You are given multiple partial extraction results (some may be duplicates or overlapping):\n"
    "{partial_results}\n\n"
    "Instruction: {parse_description}\n"
    "Rules:\n"
    "1) Remove duplicates and contradictions\n"
    "2) If the instruction implies a single best answer (e.g., 'highest', 'first', 'max'), "
    "   choose exactly one consistent final answer\n"
    "3) Output ONLY the requested data (no commentary)\n"
    "4) If nothing valid remains, return ''"
)

# function to create the Azure Open AI Model
def _make_llm() -> AzureChatOpenAI:
    """
    Build an Azure OpenAI chat model from env:
      OPENAI_API_KEY
      OPENAI_API_ENDPOINT
      OPENAI_API_EMBEDDING_VERSION
      AZURE_OPENAI_DEPLOYMENT
    """
    api_key = get_OPENAI_API_KEY() 
    endpoint = os.getenv("OPENAI_API_ENDPOINT")
    version  = os.getenv("OPENAI_API_EMBEDDING_VERSION")
    deploy   = os.getenv("AZURE_OPENAI_DEPLOYMENT")

    if not (api_key and endpoint and deploy):
        raise RuntimeError(
            "Missing one or more Azure env vars: OPENAI_API_KEY, "
            "OPENAI_API_ENDPOINT, AZURE_OPENAI_DEPLOYMENT"
        )

    # langchain-openai expects azure_deployment as the 'model' identifier
    return AzureChatOpenAI(
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=version,
        azure_deployment=deploy,
        temperature=0,
        max_tokens=4000,
        request_timeout=120,
    )

def unique_lines(text: str) -> str:
    seen = set()
    out = []
    for line in text.splitlines():
        k = line.strip()
        if k and k.lower() not in seen:
            seen.add(k.lower())
            out.append(line)
    return "\n".join(out)

def dedupe_answer(answer: str) -> str:
    seen = set()
    out = []
    for line in answer.splitlines():
        k = line.strip()
        if k and k.lower() not in seen:
            seen.add(k.lower())
            out.append(line)
    return "\n".join(out)
    
# function to parse the chunks to the LLM
def parse_with_azure_llm(dom_chunks: list[str], parse_description: str) -> str:
    llm = _make_llm()

    # MAP
    partials = []
    for ch in dom_chunks:
        resp = ( _MAP_PROMPT | llm ).invoke({
            "dom_content": ch, "parse_description": parse_description
        })
        text = getattr(resp, "content", resp)
        if text and text.strip():
            partials.append(text.strip())

    # local dedupe before reduce
    partials = list(dict.fromkeys([p for p in partials if p != ""]))

    # REDUCE to a single, canonical output
    reduce_in = "\n".join(partials)
    final = ( _REDUCE_PROMPT | llm ).invoke({
        "partial_results": reduce_in,
        "parse_description": parse_description
    })
    final_text = getattr(final, "content", final).strip()

    # safety dedupe (if the user asked for lists)
    return dedupe_answer(final_text)
