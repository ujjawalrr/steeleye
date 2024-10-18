from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func, text
from . import models, schemas
from .database import SessionLocal, engine


from openai import AzureOpenAI
import re
import json
from datetime import datetime
from pydantic import BaseModel
from dotenv import dotenv_values

values = dotenv_values()

api_key = values['AZURE_OPENAI_API_KEY']
azure_endpoint = values['AZURE_OPENAI_API_BASE']
api_version = values['AZURE_OPENAI_API_VERSION']
deployment = values['AZURE_OPENAI_DEPLOYMENT_NAME']

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/")
def test_api():
    return "Hello World!"

@app.get("/api/camerafeeds/", response_model=list[schemas.CameraFeed])
def get_feeds(db: Session = Depends(get_db)):
    return db.query(models.CameraFeed).all()

@app.get("/api/smsunits/", response_model=list[schemas.SmsUnit])
def get_units(db: Session = Depends(get_db)):
    return db.query(models.SmsUnit).all()

@app.get("/api/unitladles/{unitId}", response_model=list[schemas.Ladle])
def get_unit_ladles(unitId: str, db: Session = Depends(get_db)):
    ladles = db.query(models.Ladle).filter(models.Ladle.unitId == unitId).order_by(asc(models.Ladle.ladleId)).all()
    if not ladles:
        raise HTTPException(status_code=404, detail="Ladles not found for the specified unit")
    return ladles

@app.post("/api/addNewLadle/", response_model=schemas.Ladle)
def add_new_ladle(ladle: schemas.LadleCreate, db: Session = Depends(get_db)):
    db_ladle = models.Ladle(**ladle.dict())
    
    db.add(db_ladle)
    
    db.commit()
    
    db.refresh(db_ladle)
    
    return db_ladle

@app.delete("/api/deleteLadle/{id}", response_model=schemas.Ladle)
def delete_ladle(id: int, db: Session = Depends(get_db)):
    ladle = db.query(models.Ladle).filter(models.Ladle.id == id).first()
    
    if not ladle:
        raise HTTPException(status_code=404, detail="Ladle not found")
    
    db.delete(ladle)
    db.commit()
    
    return ladle

@app.delete("/api/deleteUnit/{id}", response_model=schemas.SmsUnit)
def delete_unit(id: int, db: Session = Depends(get_db)):
    unit = db.query(models.SmsUnit).filter(models.SmsUnit.id == id).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="SMS Unit not found")
    
    db.delete(unit)
    db.commit()
    
    return unit

@app.get("/api/ladle-history/{unitId}/{ladleId}", response_model=list[schemas.LadleHistory])
def get_unit_ladles(unitId: str, ladleId: str, db: Session = Depends(get_db)):
    history = db.query(models.LadleHistory).filter((models.LadleHistory.unitId == unitId) & (models.LadleHistory.ladleId == ladleId)).order_by(desc(models.LadleHistory.timestamp)).all()
    if not history:
        raise HTTPException(status_code=404, detail="History not found for the specified ladle")
    return history

@app.get("/api/cycle-count/{unitId}/{ladleId}", response_model=int)
def get_cycle_count(unitId: str, ladleId: str, db: Session = Depends(get_db)):
    count = db.query(func.count()).filter(
        (models.LadleHistory.cameraId == f"{unitId.replace(" ", "")}_01") &
        (models.LadleHistory.unitId == unitId) &
        (models.LadleHistory.ladleId == ladleId)
    ).scalar()

    if count == 0:
        raise HTTPException(status_code=404, detail="No history found for the specified ladle")

    return count


class MessageRequest(BaseModel):
    message: str

def convert_to_json(response):
    try:
        # Remove the triple backticks and "json" from the response string
        cleaned_response = re.sub(r'```json|```', '', response).strip()

        # Replace all newline characters with escaped newline characters
        escaped_response = cleaned_response \
            .replace('\\\n', '\\n') \
            .replace('\\r\\n', '\\n') \
            .replace('\\r', '\\n')

        # Parse the cleaned and escaped response string to a JSON object
        response_object = json.loads(escaped_response)
        return response_object
    except Exception:
        return None

def get_completion(messages):
    try:

        client = AzureOpenAI(
            api_key=api_key,
            api_version=api_version,
            azure_endpoint=azure_endpoint
        )
        # print(messages)
        completion = client.chat.completions.create(
            model=deployment,
            messages=messages
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise e


def get_context(question):
    # TODO: Add some custom queries
    context = []
    return context

def sql_query(sql, db: Session):
    try:
        result = db.execute(text(sql))
        rows = result.fetchall()
        columns = result.keys()
        # Convert result to lists
        column_list = list(columns)
        row_list = [list(row) for row in rows]
        row_final = []
        for row in row_list:
            row_dict = {}
            for i in range(len(column_list)):
                row_dict[column_list[i]] = row[i]
            row_final.append(row_dict)
        print("row_list", row_list)
        print("row_final", row_final)
        return {'columns': column_list, 'rows': row_final}

    except Exception as e:
        print("Error yha hai",e)
        return {'message': "Error in executing the query!", 'error': str(e)}

@app.post("/api/message")
def message_endpoint(msg_req: MessageRequest, db: Session = Depends(get_db)):
    user_message = msg_req.message
    # client_id = msg_req.clientId
    try:
        catalog = """\n
        Table: ladle_history
        Columns:\n
        id int AI PK 
        cameraId varchar(255) 
        unitId varchar(255) 
        ladleId varchar(255) 
        timestamp datetime
        """
        instructions = ''
        system_prompt = (
            "You DO NOT write SQL queries for CREATE, UPDATE, DELETE operations. You ONLY give assistance for READ Sql queries operations. Only write queries with time frame constraints, using only the tables and columns that are required to solve the user's question. The queries you write will be executed on the database, so ensure they are complete and correct, don’t leave blank spaces for the user to fill in. Write complete sql queries."
            "\nALSO give a SHORT `Explanation` of the query and `Question` for which you have written."
            "\n-NEVER end your SQL queries with ';' "
            "\n-Do not consider constraints of your knowledge cut-off date, just write the query considering the full timeframe as asked by the user."
            "\n-Don't write sql query when you are not sure about the answer. If you are not sure about the answer, please ask the user for more information. And if user question doesn't contains any relation with the user provided catalog, please ask the user to check the question."
            "\n-A week starts from Monday and ends on Sunday."
            "\n-%Functions NOT to use in queries as they are not registered in our database editor"
            "\n-unix_timestamp"
            "\n-UNIX_MILLIS"
            "\n-CAST"
            "\n-FIELD"
            "\n-FORMAT_DATE"
            "\n-FORMAT_TIMESTAMP"
            "\n-ifnull"
            "\n%End of functions not to use"
            "\n-GROUP BY, ORDER BY: Use 1,2,3 in GROUP BY statements as PrestoSQL does not allow the use of aliases in GROUP BY clauses that are introduced in the SELECT part of the query. Always try to use numbers in GROUP BY statements"
            "\n-Ensure that any columns generated within subqueries are either directly selected or ALIASED by NUMBERS in the outer query to avoid 'Column cannot be resolved' errors."
            "\n-Whenever matching a string try to ensure you are converting to lowercase to minimise errors. Use lower(city)."
            "\n\n%User Defined Catalog of database:\n\n" +
            catalog +
            "\n\n%Very Important Instructions\n\n" +
            'You are an assistant that outputs responses in valid JSON format. It is crucial that all responses follow this format exactly. The keys must be `Sql`, `Explanation`, `Question` and `Assistant_Reply`, and the JSON format should be:\n```json\n{\n  "Sql": "respective response",\n  "Explanation": "respective response",\n  "Question": "respective response",\n "Assistant_Reply": "respective response"\n}\n```\nNo other format is acceptable. Always ensure the response is a valid JSON object with these keys and structure.\n' +
            instructions
        )
        context = get_context(user_message)
        filtered_context = ""
        for element in context:
            filtered_context += f"Question: {element['Question']}\nExplanation: {element['Explanation']}\nQuery: {element['Query']}\n\n"

        user_prompt = "\n"
        if len(filtered_context) > 0:
            user_prompt += "This might be helpful context from the saved queries : \n" + filtered_context
        user_prompt += "user_input= " + user_message + "\n\n"
        ai_msg = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        current_attempt = 1
        while current_attempt <= 3:
            result = get_completion(ai_msg)
            msg_content = result
            ai_msg.append({"role": "assistant", "content": msg_content})
            converted_result = convert_to_json(msg_content)
            
            if isinstance(converted_result, dict):
                if not converted_result.get('Sql'):
                    new_message = {
                        'message': {'error': converted_result.get('Assistant_Reply')},
                        'sender': 'ai',
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    return {'newMessage': new_message, 'message': "Response Received!"}
                else:
                    print(converted_result['Sql'])
                    data = sql_query(converted_result['Sql'], db)
                    print(data)
                    print(data['columns'], data['rows'])
                    if data.get('error'):
                        ai_msg.append({
                            'role': 'user',
                            'content': f"Error Message: {data['message']}\nError: {data['error']}"
                        })
                        current_attempt += 1
                    else:
                        new_message = {
                            'message': {
                                'rows': data['rows'],
                                'columns': data['columns'],
                                'query': converted_result['Sql'],
                                'explanation': converted_result['Explanation'],
                                'question': converted_result['Question'],
                            },
                            'sender': 'ai',
                            'timestamp': datetime.utcnow().isoformat()
                        }
                        return {'newMessage': new_message, 'message': "Response Received!"}
            else:
                break
        new_message = {
            'message': {'error': "Kindly re-write your question in more understandable words!"},
            'sender': 'ai',
            'timestamp': datetime.utcnow().isoformat()
        }
        return {'newMessage': new_message, 'message': "Kindly re-write your question in more understandable words!"}
    except Exception as e:
        # Print or log the error
        print(f"Error in processing the request: {e}")
        # Optionally include the error message in the HTTPException
        raise HTTPException(status_code=500, detail=f"Error in processing the request: {e}")
