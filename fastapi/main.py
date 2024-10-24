import uvicorn
import threading
from backend.detect import main as detect_main

if __name__ == "__main__":
    # detection_thread = threading.Thread(target=detect_main)
    # detection_thread.start()
    
    uvicorn.run("backend.main:app")