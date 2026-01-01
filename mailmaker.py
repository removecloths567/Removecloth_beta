import base64
import time
import random
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()

API_KEY = "4d7200b0-0bd8-42c6-ad47-af513959adab"
CREATE_URL = "https://unclothy.com/api/v2/task/create"
TASK_URL = "https://unclothy.com/api/v2/task/"

HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

SETTINGS = {
    "generationMode": "naked",
    "gender": "female",
    "age": "automatic",
    "bodyType": "skinny",
    "breastsSize": "small",
    "assSize": "small",
    "pussy": "shaved",
    "penis": "shaved"
}


def image_file_to_base64(file: UploadFile) -> str:
    return base64.b64encode(file.file.read()).decode("utf-8")


@app.post("/generate")
def generate_image(image: UploadFile = File(...)):
    # Convert image to base64
    image_base64 = image_file_to_base64(image)

    payload = {
        "base64": image_base64,
        "settings": SETTINGS
    }

    # Create task
    create_resp = requests.post(CREATE_URL, json=payload, headers=HEADERS)
    if create_resp.status_code != 201:
        raise HTTPException(status_code=500, detail="Task creation failed")

    task_id = create_resp.json()["result"]["task_id"]
    print(task_id)
    # Poll task status (5–10 sec gap)
    while True:
        time.sleep(random.uniform(5, 10))

        status_resp = requests.get(TASK_URL + task_id, headers=HEADERS)
        if status_resp.status_code != 200:
            continue

        data = status_resp.json()["result"]

        if data["status"] == "completed":
            return {
                "task_id": task_id,
                "result_url": data["url"],
                "elapsed_time": data.get("elapsed_time")
            }
