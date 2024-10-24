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
from typing import Optional
import random

values = dotenv_values()

api_key = values['AZURE_OPENAI_API_KEY']
azure_endpoint = values['AZURE_OPENAI_API_BASE']
api_version = values['AZURE_OPENAI_API_VERSION']
deployment = values['AZURE_OPENAI_DEPLOYMENT_NAME']

models.Base.metadata.create_all(bind=engine)

class UserWithoutPassword(BaseModel):
    id: str
    name: str
    email: str
    role: str
    
class Password(BaseModel):
    password: str
    
class LoginForm(BaseModel):
    email: str
    password: str
    
class LadleDetails(BaseModel):
    id: Optional[str]
    unitId: Optional[str]
    ladleId: Optional[str]
    grade: Optional[str]
    capacity: Optional[float]
    weight: Optional[float]
    temperature: Optional[float]
    timestamp: Optional[datetime]

class CameraFeedWithLadle(BaseModel):
    id: str
    unitId: str
    subunit: str
    location: str
    camera_url: str
    state: bool
    ladleId: Optional[str]
    timestamp: datetime
    last_detection: datetime
    ladle_details: Optional[LadleDetails]
    
    class Config:
        from_attributes = True

    
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/")
def test_api():
    return "Welcome to Steel Eye!"

@app.get("/api/camerafeeds", response_model=list[schemas.CameraFeed])
def get_feeds(db: Session = Depends(get_db)):
    return db.query(models.CameraFeed).all()

@app.get("/api/users", response_model=list[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User.id, models.User.name, models.User.email, models.User.role).order_by(asc(models.User.role)).all()

@app.post("/api/login", response_model=schemas.User)
def login_user(login: LoginForm, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.password:
        token = random.randint(100000, 999999)
        user.reset_token = token
        db.commit()
        db.refresh(user)
        detail = {}
        detail['token'] = token
        detail['user_id'] = user.id
        raise HTTPException(status_code=402, detail=detail)
    
    if user.password != login.password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # user_response = UserWithoutPassword(id=user.id, name=user.name, email=user.email, role=user.role)
    
    return user

@app.post("/api/reset-password/{id}/{token}", response_model=schemas.User)
def reset_password(password: Password, id: str, token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.reset_token != token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user.password = password.password
    user.reset_token = None
    db.commit()
    db.refresh(user)
    
    user_response = schemas.User(id=user.id, name=user.name, email=user.email, role=user.role)
    
    return user_response

@app.post("/api/addNewUser", response_model=schemas.User)
def add_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    
    db.add(db_user)
    
    db.commit()
    
    db.refresh(db_user)
    
    return db_user

@app.delete("/api/deleteUser/{id}", response_model=schemas.User)
def delete_user(id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return user

@app.get("/api/smsunits", response_model=list[schemas.SmsUnit])
def get_units(db: Session = Depends(get_db)):
    return db.query(models.SmsUnit).all()

@app.post("/api/addNewUnit", response_model=schemas.SmsUnit)
def add_new_unit(unit: schemas.SmsUnitCreate, db: Session = Depends(get_db)):
    db_unit = models.SmsUnit(**unit.dict())
    
    db.add(db_unit)
    
    db.commit()
    
    db.refresh(db_unit)
    
    return db_unit

@app.delete("/api/deleteUnit/{id}", response_model=schemas.SmsUnit)
def delete_unit(id: str, db: Session = Depends(get_db)):
    unit = db.query(models.SmsUnit).filter(models.SmsUnit.id == id).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="SMS Unit not found")
    
    db.delete(unit)
    db.commit()
    
    return unit

@app.put("/api/updateUnit/{id}", response_model=schemas.SmsUnit)
def update_unit(id: str, unit: schemas.SmsUnitCreate, db: Session = Depends(get_db)):
    existing_unit = db.query(models.SmsUnit).filter(models.SmsUnit.id == id).first()
    
    if not existing_unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    for key, value in unit.dict().items():
        setattr(existing_unit, key, value)
    
    db.commit()
    db.refresh(existing_unit)
    
    return existing_unit

@app.get("/api/unitladles/{unitId}", response_model=list[schemas.Ladle])
def get_unit_ladles(unitId: str, db: Session = Depends(get_db)):
    ladles = db.query(models.Ladle).filter(models.Ladle.unitId == unitId).order_by(asc(models.Ladle.ladleId)).all()
    if not ladles:
        raise HTTPException(status_code=404, detail="Ladles not found for the specified unit")
    return ladles

@app.post("/api/addNewLadle", response_model=schemas.Ladle)
def add_new_ladle(ladle: schemas.LadleCreate, db: Session = Depends(get_db)):
    db_ladle = models.Ladle(**ladle.dict())
    
    db.add(db_ladle)
    
    db.commit()
    
    db.refresh(db_ladle)
    
    return db_ladle

@app.delete("/api/deleteLadle/{id}", response_model=schemas.Ladle)
def delete_ladle(id: str, db: Session = Depends(get_db)):
    ladle = db.query(models.Ladle).filter(models.Ladle.id == id).first()
    
    if not ladle:
        raise HTTPException(status_code=404, detail="Ladle not found")
    
    db.delete(ladle)
    db.commit()
    
    return ladle

@app.put("/api/updateLadle/{id}", response_model=schemas.Ladle)
def update_ladle(id: str, ladle: schemas.LadleCreate, db: Session = Depends(get_db)):
    existing_ladle = db.query(models.Ladle).filter(models.Ladle.id == id).first()
    
    if not existing_ladle:
        raise HTTPException(status_code=404, detail="Ladle not found")
    
    for key, value in ladle.dict().items():
        setattr(existing_ladle, key, value)
    
    db.commit()
    db.refresh(existing_ladle)
    
    return existing_ladle

@app.get("/api/unitcameras/{unitId}", response_model=list[CameraFeedWithLadle])
def get_unit_cameras(unitId: str, db: Session = Depends(get_db)):
    # Perform a LEFT JOIN between CameraFeed and Ladle on ladleId
    camerafeeds_with_ladle = (
        db.query(models.CameraFeed, models.Ladle)
        .outerjoin(models.Ladle, models.CameraFeed.ladleId == models.Ladle.id)
        .filter(models.CameraFeed.unitId == unitId)
        .order_by(asc(models.CameraFeed.location))
        .all()
    )
    
    if not camerafeeds_with_ladle:
        raise HTTPException(status_code=404, detail="Cameras not found for the specified unit")

    # Format the result to match the response model
    result = []
    for camera_feed, ladle in camerafeeds_with_ladle:
        camera_feed_data = {
            "id": camera_feed.id,
            "unitId": camera_feed.unitId,
            "subunit": camera_feed.subunit,
            "location": camera_feed.location,
            "camera_url": camera_feed.camera_url,
            "state": camera_feed.state,
            "ladleId": camera_feed.ladleId,
            "timestamp": camera_feed.timestamp,
            "last_detection": camera_feed.last_detection,
            "ladle_details": {
                "id": ladle.id if ladle else None,
                "unitId": ladle.unitId if ladle else None,
                "ladleId": ladle.ladleId if ladle else None,
                "grade": ladle.grade if ladle else None,
                "capacity": ladle.capacity if ladle else None,
                "weight": ladle.weight if ladle else None,
                "temperature": ladle.temperature if ladle else None,
                "timestamp": ladle.timestamp if ladle else None,
            } if ladle else None  # Handle case when ladle is None
        }
        result.append(camera_feed_data)

    return result


@app.post("/api/addNewCamera", response_model=schemas.CameraFeed)
def add_new_camerafeed(camerafeed: schemas.CameraFeedCreate, db: Session = Depends(get_db)):
    db_camerafeed = models.CameraFeed(**camerafeed.dict())
    
    db.add(db_camerafeed)
    
    db.commit()
    
    db.refresh(db_camerafeed)
    
    return db_camerafeed

@app.delete("/api/deleteCamera/{id}", response_model=schemas.CameraFeed)
def delete_camerafeed(id: str, db: Session = Depends(get_db)):
    camerafeed = db.query(models.CameraFeed).filter(models.CameraFeed.id == id).first()
    
    if not camerafeed:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    db.delete(camerafeed)
    db.commit()
    
    return camerafeed

class CameraFeedUpdate(BaseModel):
    state: bool
    
@app.put("/api/toggleCameraState/{id}", response_model=schemas.CameraFeed)
def toggle_camera_state(id: str, state: CameraFeedUpdate, db: Session = Depends(get_db)):
    camerafeed = db.query(models.CameraFeed).filter(models.CameraFeed.id == id).first()
    
    if not camerafeed:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camerafeed.state = state.state
    db.commit()
    db.refresh(camerafeed)
    
    return camerafeed

@app.put("/api/updateCamera/{id}", response_model=schemas.CameraFeed)
def update_camerafeed(id: str, camerafeed: schemas.CameraFeed, db: Session = Depends(get_db)):
    existing_camerafeed = db.query(models.CameraFeed).filter(models.CameraFeed.id == id).first()
    
    if not existing_camerafeed:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    for key, value in camerafeed.dict().items():
        setattr(existing_camerafeed, key, value)
    
    db.commit()
    db.refresh(existing_camerafeed)
    
    return existing_camerafeed

@app.get("/api/ladle/{id}", response_model=schemas.Ladle)
def get_ladle(id: str, db: Session = Depends(get_db)):
    ladle = db.query(models.Ladle).filter(models.Ladle.id == id).first()
    if not ladle:
        raise HTTPException(status_code=404, detail="Ladle not found")
    return ladle

@app.get("/api/ladle-history/{id}", response_model=list[schemas.LadleHistory])
def get_ladle_history(id: str, db: Session = Depends(get_db)):
    history = db.query(models.LadleHistory).filter(models.LadleHistory.ladleId == id).order_by(desc(models.LadleHistory.departure_time)).all()
    if not history:
        raise HTTPException(status_code=404, detail="History not found for the specified ladle")
    return history

@app.get("/api/cycle-count/{id}", response_model=int)
def get_cycle_count(id: str, db: Session = Depends(get_db)):
    count = db.query(func.count()).filter(
        (models.LadleHistory.cameraId == f"{id.replace(" ", "")}_01") &
        (models.LadleHistory.ladleId == id)
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


