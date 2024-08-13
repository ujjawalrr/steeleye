import cv2
import numpy as np
import imutils
from ultralytics import YOLO
import datetime;
import csv
from scipy import stats
location = "A"
filepath = r"C:\Users\Prudhvi\Desktop\data.csv"
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# mongouri = "mongodb+srv://ujjawalrr:steeleye07082024@steeleye.azbff.mongodb.net/?retryWrites=true&w=majority&appName=steelEye"
mongouri = "mongodb://localhost:27017"
# Create a new client and connect to the server
client = MongoClient(mongouri, server_api=ServerApi('1'))
db = client['test']
collection = db['camerafeeds']

# Replace the below URL with your own. Make sure to add "/shot.jpg" at last.
#url = "http://192.168.95.171:8080/shot.jpg"
fieldnames = ['detected_ladle_number', 'timestamp','location']

with open(filepath, "a") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

def append_data(Ladlenum, ct):

    with open(filepath, "a") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writerow({
            "detected_ladle_number" : Ladlenum,
            "timestamp": ct,
            "location" : location
        })



def model(img,ct):
    model = YOLO(r"C:\Users\Prudhvi\Downloads\best.pt")
    num=0
    try :
        res = model.predict(source=img, conf=0.5)

        if len(res[0].boxes.data) == 2:
            box1 = res[0].boxes.xywh[0]
            bounding_box1 = box1.cpu().numpy()
            box2 = res[0].boxes.xywh[1]
            bounding_box2 = box2.cpu().numpy()

            if res[0].boxes.data[0][0].numpy() < res[0].boxes.data[1][0].numpy():
                digit1 = res[0].boxes.data[0][5].numpy()
                digit2 = res[0].boxes.data[1][5].numpy()
            else:
                digit2 = res[0].boxes.data[0][5].numpy()
                digit1 = res[0].boxes.data[1][5].numpy()
            num = (digit1 * 10) + digit2
            #num = number.tostring()
            x0 = bounding_box1[0] - bounding_box1[2] / 2
            x1 = bounding_box1[0] + bounding_box1[2] / 2
            y0 = bounding_box1[1] - bounding_box1[3] / 2
            y1 = bounding_box1[1] + bounding_box1[3] / 2
            x2 = bounding_box2[0] - bounding_box2[2] / 2
            x3 = bounding_box2[0] + bounding_box2[2] / 2
            y2 = bounding_box2[1] - bounding_box2[3] / 2
            y3 = bounding_box2[1] + bounding_box2[3] / 2

            start_point1 = (int(x0), int(y0))
            end_point1 = (int(x1), int(y1))
            start_point2 = (int(x2), int(y2))
            end_point2 = (int(x3), int(y3))
            #img = cv2.imread(s)
            cv2.rectangle(img, start_point1, end_point1, color=(0, 255, 0), thickness=2)
            cv2.rectangle(img, start_point2, end_point2, color=(0, 255, 0), thickness=2)
            cv2.putText(img, str(num), (int(x0),(int(y0) - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
            append_data(num,ct)

        elif len(res[0].boxes.data) == 1:
            box1 = res[0].boxes.xywh[0]
            bounding_box1 = box1.cpu().numpy()
            digit1 = res[0].boxes.data[0][5].numpy()

            num = (digit1)
            #num = number.tostring()
            x0 = bounding_box1[0] - bounding_box1[2] / 2
            x1 = bounding_box1[0] + bounding_box1[2] / 2
            y0 = bounding_box1[1] - bounding_box1[3] / 2
            y1 = bounding_box1[1] + bounding_box1[3] / 2
            start_point1 = (int(x0), int(y0))
            end_point1 = (int(x1), int(y1))
            cv2.rectangle(img, start_point1, end_point1, color=(0, 255, 0), thickness=2)
            cv2.putText(img, str(num), (int(x0), (int(y0) - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
            append_data(num, ct)

        return img,num



    except IndexError:
        print("no num detected")
        return img

# cap = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.2:554/stream1')
cap1 = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.2:554/stream1')
cap2 = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.3:554/stream1')

ct = 1
c = 1
# While loop to continuously fetching data from the Url
num_list=[]
while True:
    #img_resp = requests.get(url)
    #ct = datetime.datetime.now()
    #img_arr = np.array(bytearray(img_resp.content), dtype=np.uint8)
    #img = cv2.imdecode(img_arr, -1)
    #img = imutils.resize(img, width=1000, height=1800)

    ret1, frame1 = cap1.read(0)
    fps1 = cap1.get(cv2.CAP_PROP_FPS)
    img2_1 = imutils.resize(frame1, width=800, height=800)
    ret2, frame2 = cap2.read(0)
    fps2 = cap2.get(cv2.CAP_PROP_FPS)
    img2_2 = imutils.resize(frame2, width=800, height=800)
    #cv2.imshow('frame', frame)
    if c%50==0:
        img2_1,num1 = model(img2_1, ct)
        img2_2,num2 = model(img2_2, ct)
        cameraIds = [1, 2]

        # Define the filter and update operations
        filter_query1 = {'cameraId': cameraIds[0]}
        update_query1 = {'$set': {'ladle': int(num1)}}
        filter_query2 = {'cameraId': cameraIds[1]}
        update_query2 = {'$set': {'ladle': int(num2)}}
        # Update the document if it exists, or insert a new document if it does not
        result1 = collection.update_one(filter_query1, update_query1, upsert=True)
        result2 = collection.update_one(filter_query2, update_query2, upsert=True)

        print('number mode', num1)
        print('number mode', num2)
        num_list.append(num1)
        num_list.append(num2)
    position = (10, 50)
    cv2.putText(
        img2_1,  # numpy array on which text is written
        str(fps1),  # text
        position,  # position at which writing has to start
        cv2.FONT_HERSHEY_SIMPLEX,  # font family
        1,  # font size
        (209, 80, 0, 255),  # font color
        3)# font stroke
    cv2.putText(
        img2_2,  # numpy array on which text is written
        str(fps2),  # text
        position,  # position at which writing has to start
        cv2.FONT_HERSHEY_SIMPLEX,  # font family
        1,  # font size
        (209, 80, 0, 255),  # font color
        3)
    cv2.imshow("cctv_cam", img2_1)
    cv2.imshow("Phone Cam",img2_2)
    c+=1
    # print('Number in each frame',num)

    if len(num_list)%10==0:
        num_mode=stats.mode(num_list)
        num_list=[]

    if cv2.waitKey(1) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        break


    # Press Esc key to exit
    #if cv2.waitKey(1) == 27:
    #    break
cap.release()
cv2.destroyAllWindows()

