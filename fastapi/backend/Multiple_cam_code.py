import cv2
import numpy as np
import imutils
from ultralytics import YOLO
import statistics as stats
import pymysql
from pymysql import OperationalError
from datetime import datetime, timezone
from dotenv import dotenv_values

values = dotenv_values()

host = values['DB_HOST']
user = values['DB_USER']
password = values['DB_PASS']
database = values['DB_SCHEMA']

def insert_number_into_db(camera, detected_number):
    try:
        connection = pymysql.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )
        camera_unitId = camera['unitId']
        previous_ladleId = camera['ladleId']
        camera_id = camera['id']
        camera_location = camera['location']
        camera_timestamp = camera['timestamp']
        with connection.cursor() as cursor:
            current_time = datetime.now(timezone.utc)
            if detected_number == 0:
                if(previous_ladleId != str(detected_number)):
                    if previous_ladleId != '0':
                        get_previous_ladle_query = """SELECT * FROM ladles WHERE id = %s"""
                        cursor.execute(get_previous_ladle_query, (previous_ladleId))
                        results = cursor.fetchall()
                        if len(results) != 0:
                            ladle_temperature = results[0][6]
                            measurement_time = results[0][7].replace(tzinfo=timezone.utc)  # Make measurement_time timezone-aware
                            time_difference = current_time - measurement_time
                            difference_in_minutes = time_difference.total_seconds() / 60
                            current_temperature = ladle_temperature - (difference_in_minutes * 10 / 15)
                            
                            insert_query = """
                                INSERT INTO ladle_history (location, ladleId, temperature, arrival_time, departure_time)
                                VALUES (%s, %s, %s, %s, %s)
                            """
                            cursor.execute(insert_query, (camera_location, previous_ladleId, current_temperature, camera_timestamp, current_time))
                    
                    update_query = """
                        UPDATE camerafeeds
                        SET ladleId = %s, timestamp = %s, last_detection = %s
                        WHERE id = %s
                    """
                    cursor.execute(update_query, (str(detected_number), current_time, current_time, camera_id))
                    connection.commit()
                else:
                    update_query = """
                        UPDATE camerafeeds
                        SET last_detection = %s
                        WHERE id = %s
                    """
                    cursor.execute(update_query, (current_time, camera_id))
                    connection.commit()
                    
            else:
                get_ladle_query = """SELECT * FROM ladles WHERE unitId = %s AND ladleId = %s"""
                cursor.execute(get_ladle_query, (camera_unitId, str(detected_number)))
                results = cursor.fetchall()
                if len(results) != 0:
                    detected_ladleId = results[0][0]
                    if(previous_ladleId != detected_ladleId):
                        if previous_ladleId != '0':
                            get_previous_ladle_query = """SELECT * FROM ladles WHERE id = %s"""
                            cursor.execute(get_previous_ladle_query, (previous_ladleId))
                            previous_ladle_results = cursor.fetchall()
                            ladle_temperature = previous_ladle_results[0][6]
                            measurement_time = previous_ladle_results[0][7].replace(tzinfo=timezone.utc)  # Make measurement_time timezone-aware
                            time_difference = current_time - measurement_time
                            difference_in_minutes = time_difference.total_seconds() / 60
                            current_temperature = ladle_temperature - (difference_in_minutes * 10 / 15)
                            
                            insert_query = """
                                INSERT INTO ladle_history (location, ladleId, temperature, arrival_time, departure_time)
                                VALUES (%s, %s, %s, %s, %s)
                            """
                            cursor.execute(insert_query, (camera_location, previous_ladleId, current_temperature, camera_timestamp, current_time))
                    
                        update_query = """
                            UPDATE camerafeeds
                            SET ladleId = %s, timestamp = %s, last_detection = %s
                            WHERE id = %s
                        """
                        cursor.execute(update_query, (detected_ladleId, current_time, current_time, camera_id))
                        connection.commit()
                    else:
                        update_query = """
                            UPDATE camerafeeds
                            SET last_detection = %s
                            WHERE id = %s
                        """
                        cursor.execute(update_query, (current_time, camera_id))
                        connection.commit()
                else:
                    print("Ask admin to resister new ladle in database")
                    
    except OperationalError as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if connection:
            connection.close()
            print("MySQL connection closed.")

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

        return img, num

    except IndexError:
        print("No number detected")
        return img, num

def main():
    model_path = './weights/best.pt'
    model = YOLO(model_path)
    camera_urls = []
    cameras = []
    connection = pymysql.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )
    
    try:
        with connection.cursor() as cursor:
            get_query = "SELECT * FROM camerafeeds WHERE state = 1 ORDER BY location"
            cursor.execute(get_query)
            results = cursor.fetchall()
            for row in results:
                camera = {
                    'id': row[0],
                    'unitId': row[1],
                    'subunit': row[2],
                    'location': row[3],
                    'url': row[4],
                    'ladleId': row[6],
                    'timestamp': row[7]
                }
                cameras.append(camera)
                if(row[4] == '0'):
                    camera_urls.append(0)
                else:
                    camera_urls.append(row[4])    
    finally:
        connection.close()
        
    insert_number_into_db(cameras[0], 0)
    # insert_number_into_db(cameras[1], 0)
    # insert_number_into_db(cameras[1], 23)
    # insert_number_into_db(cameras[1], 21)
    # insert_number_into_db(cameras[2], 0)
    
    # caps = [cv2.VideoCapture(url) for url in camera_urls]
    # num_lists = [[] for _ in camera_urls]
    caps = []
    num_lists = []
    c = 1

    while False:
        for i, cap in enumerate(caps):
            ret, frame = cap.read()
            if not ret:
                continue
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame = imutils.resize(frame, width=800, height=800)
            
            if c % 50 == 0:
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
                print(f'Camera {i+1}: {num_list} Mode of detected numbers {num_mode}')
                # print(camera_urls[i])
                # insert this number in mysql db
                # insert_number_into_db(cameras[i], num_mode)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    for cap in caps:
        cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
