import cv2
import numpy as np
import imutils
from ultralytics import YOLO
import statistics as stats

def model_pred(img, model):
    num = 0
    try:
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
            cv2.rectangle(img, start_point1, end_point1, color=(0, 255, 0), thickness=2)
            cv2.rectangle(img, start_point2, end_point2, color=(0, 255, 0), thickness=2)
            cv2.putText(img, str(num), (int(x0), (int(y0) - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)

        elif len(res[0].boxes.data) == 1:
            box1 = res[0].boxes.xywh[0]
            bounding_box1 = box1.cpu().numpy()
            digit1 = res[0].boxes.data[0][5].numpy()

            num = digit1
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
        print("No number detected")
        return img,num

def main():
    model_path = './weights/best.pt'
    model = YOLO(model_path)
    
    camera_urls = [
        0,  # Default webcam
        'http://192.168.0.3:8080/video',
    ]

    caps = [cv2.VideoCapture(url) for url in camera_urls]
    num_lists = [[] for _ in camera_urls]
    c = 1

    while True:
        for i, cap in enumerate(caps):
            ret, frame = cap.read()
            if not ret:
                continue
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame = imutils.resize(frame, width=800, height=800)
            
            if c % 50 == 0:
                # print(model(frame, model))
                frame, num = model_pred(frame, model)
                num_lists[i].append(int(num))
                print(f'Camera {i+1}: Detected number {num}')
            
            cv2.putText(frame, str(fps), (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (209, 80, 0, 255), 3)
            cv2.imshow(f'Camera {i+1}', frame)
        
        c += 1
        
        for i, num_list in enumerate(num_lists):
            if len(num_list) == 10:
                num_mode = stats.mode(num_list)
                num_lists[i] = []
                print(f'Camera {i+1}: Mode of detected numbers {num_mode}')
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    for cap in caps:
        cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
