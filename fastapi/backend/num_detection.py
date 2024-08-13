import cv2
import numpy as np
import imutils
from ultralytics import YOLO
from scipy import stats

def model(img):
    model = YOLO('./weights/best.pt')
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

        return img,num



    except IndexError:
        print("no num detected")
        return img

# cap = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.2:554/stream1')
# cap1 = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.2:554/stream1')
# cap2 = cv2.VideoCapture('rtsp://adminp:adminp@192.168.0.3:554/stream1')
cap1 = cv2.VideoCapture(0)
cap2 = cv2.VideoCapture('http://192.168.116.223:8080/video')
c = 1
# While loop to continuously fetching data from the Url
num_list1 = []
num_list2 = []
while True:

    ret1, frame1 = cap1.read(0)
    fps1 = cap1.get(cv2.CAP_PROP_FPS)
    img2_1 = imutils.resize(frame1, width=800, height=800)
    ret2, frame2 = cap2.read(0)
    fps2 = cap2.get(cv2.CAP_PROP_FPS)
    img2_2 = imutils.resize(frame2, width=800, height=800)
    #cv2.imshow('frame', frame)
    if c%50==0:
        img2_1,num1 = model(img2_1)
        img2_2,num2 = model(img2_2)
        cameraIds = [1, 2]
        num_list1.append(num1)
        num_list2.append(num2)
        print('num1',num1)
        print('num2',num2)
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

    if len(num_list1)%10==0:
        num_mode1 = stats.mode(num_list1)
        num_list1=[]
        print('number mode1', num_mode1)
        # print('number mode', int(num_mode1))
        
    if len(num_list2)%10==0:    
        num_mode2 = stats.mode(num_list2)
        num_list2=[]
        print('number mode2', num_mode2)
        # print('number mode', int(num_mode2))

    if cv2.waitKey(1) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        break


    # Press Esc key to exit
    #if cv2.waitKey(1) == 27:
    #    break
cap1.release()
cap2.release()
cv2.destroyAllWindows()

