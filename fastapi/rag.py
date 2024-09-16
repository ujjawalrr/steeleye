from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from langchain.prompts.chat import HumanMessagePromptTemplate
from langchain.chat_models import AzureChatOpenAI
from langchain.schema import SystemMessage

# Azure OpenAI credentials
AZURE_OPENAI_API_KEY=""
AZURE_OPENAI_API_VERSION="2024-05-01-preview"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_BASE="https://xyz.openai.azure.com"

# Initialize the Azure OpenAI language model
llm = AzureChatOpenAI(
    deployment_name=AZURE_OPENAI_DEPLOYMENT_NAME,
    temperature=0,
    openai_api_key=AZURE_OPENAI_API_KEY,
    openai_api_base=AZURE_OPENAI_API_BASE,
    openai_api_version=AZURE_OPENAI_API_VERSION,
)

host = 'localhost'
port = '3306'
username = 'ujjawal'
password = 'pwd'
database_schema = 'steeleye'
mysql_uri = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_schema}"

db = SQLDatabase.from_uri(mysql_uri, include_tables=['ladle_history'], sample_rows_in_table_info=2)

db_chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)

def retrieve_from_db(query: str) -> str:
    db_context = db_chain(query)
    db_context = db_context['result'].strip()
    return db_context

def generate(query: str) -> str:
    db_context = retrieve_from_db(query)
    
    system_message = """You are a ladle operator for a metal casting industry.
        You have to answer manager's questions and provide relevant information regarding ladle location and history and production values. 
        Example:
        
        Input:
        What was the last location of ladle 5 of unit SMS 1?
        """
        # Output:
        # The last location of ladle 5 of unit SMS 1 was at the cameraId SMS1_02 at 2024-08-27 12:00:00.
        # """
    
    human_qry_template = HumanMessagePromptTemplate.from_template(
        """Input:
        {human_input}
        
        Context:
        {db_context}
        
        Output:
        """
    )
    messages = [
        SystemMessage(content=system_message),
        human_qry_template.format(human_input=query, db_context=db_context)
    ]
    response = llm(messages).content
    return response

print(generate("What was the last location of ladle 1 of unit SMS 1?"))
