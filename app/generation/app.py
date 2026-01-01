# import os
# import time
# import base64
# from PIL import Image
# import requests
# from fastapi import FastAPI, HTTPException
# from fastapi.responses import FileResponse
# from dotenv import load_dotenv
# import shutil
# from io import BytesIO

# load_dotenv()
# API_KEY = os.getenv("UNCLOTHY_API_KEY")

# BASE_URL = "https://unclothy.com/api/v2"
# HEADERS = {
#     "x-api-key": "a7991891-674f-4112-9075-48e27c1a0a71",
#     "Content-Type": "application/json"
# }

# MAX_IMAGE_SIZE_MB = 5

# app = FastAPI()


# # --------------------------------------------------
# # 1. Validate Image (< 5MB)
# # --------------------------------------------------
# def validate_image(image_data: bytes):
#     try:
#         image = Image.open(BytesIO(image_data))
#         image.verify()  # Verifies if the image is valid
#     except Exception:
#         raise ValueError("Invalid image file")

#     size_mb = len(image_data) / (1024 * 1024)
#     if size_mb > MAX_IMAGE_SIZE_MB:
#         raise ValueError("Image size exceeds 5MB limit")


# # --------------------------------------------------
# # 2. Check Credits
# # --------------------------------------------------
# def check_credits() -> int:
#     url = f"{BASE_URL}/user/credits"
#     response = requests.get(url, headers=HEADERS, timeout=30)
#     response.raise_for_status()
#     data = response.json()

#     # Log the response to inspect the structure
#     print("Credits API response:", data)

#     # Check for the 'credits' field in the response
#     if "result" in data and "credits" in data["result"]:
#         return data["result"]["credits"]
#     else:
#         raise KeyError("The expected 'credits' field is missing in the API response")


# # --------------------------------------------------
# # 3. Create Task
# # --------------------------------------------------
# def create_task(base64_image: str, settings: dict) -> str:
#     url = f"{BASE_URL}/task/create"
#     payload = {
#         "base64": base64_image,
#         "settings": settings
#     }

#     response = requests.post(url, json=payload, headers=HEADERS, timeout=60)
#     response.raise_for_status()  # Ensure we handle non-200 responses
#     data = response.json()

#     # Log the response to inspect the structure
#     print("Create Task API response:", data)

#     # Now access task_id from the correct structure
#     if "result" in data and "task_id" in data["result"]:
#         return data["result"]["task_id"]
#     else:
#         raise KeyError("The expected 'task_id' field is missing in the API response")


# # --------------------------------------------------
# # 4. Poll Task Result (Updated with retry limit of 24 trials)
# # --------------------------------------------------
# def poll_task(task_id: str, timeout=240, interval=10, max_trials=24):
#     url = f"{BASE_URL}/task/{task_id}"
#     headers = {
#         "x-api-key": HEADERS["x-api-key"],  # Use the same API key as in headers
#         "Content-Type": "application/json"
#     }
#     start = time.time()
#     trials = 0  # Track the number of trials

#     while True:
#         if trials >= max_trials:
#             raise TimeoutError("Maximum number of polling trials reached (24 trials).")

#         if time.time() - start > timeout:
#             raise TimeoutError("Task polling timed out")

#         response = requests.get(url, headers=headers, timeout=30)
#         response.raise_for_status()  # Raise error for non-2xx responses
#         data = response.json()

#         # Log the response to inspect the structure
#         print("Task polling API response:", data)

#         status = data.get("result", {}).get("status")

#         if status == "completed":
#             return data["result"]

#         if status == "failed":
#             raise RuntimeError("Task failed")

#         trials += 1
#         time.sleep(interval)


# # --------------------------------------------------
# # 5. Full Pipeline for Image Generation
# # --------------------------------------------------
# def generate(base64_image: str):
#     credits = check_credits()
#     if credits < 1:
#         raise RuntimeError("Insufficient credits")

#     settings = {
#         "generationMode": "naked",
#         "gender": "female",
#         "age": "automatic",
#         "bodyType": "skinny",
#         "breastsSize": "small",
#         "assSize": "small",
#         "pussy": "shaved",
#         "penis": "shaved"
#     }

#     task_id = create_task(base64_image, settings)
#     print(task_id)
#     result = poll_task(task_id)
#     return result


# # --------------------------------------------------
# # FastAPI Endpoints
# # --------------------------------------------------

# @app.post("/generate-image/")
# async def generate_image(base64_image: str):
#     try:
#         # Decode the base64 image
#         image_data = base64.b64decode(base64_image)

#         # Validate image
#         validate_image(image_data)

#         # Call generate pipeline
#         result = generate(base64_image)

#         # Assuming result contains a path to the generated image
#         generated_image_path = result["image_path"]  # Adjust according to actual response

#         return FileResponse(generated_image_path)

#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error generating image: {str(e)}")
# import os
# import time
# import base64
# import asyncio
# import httpx
# from fastapi import FastAPI, HTTPException, BackgroundTasks
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from io import BytesIO
# from PIL import Image
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Dict, Optional
# from datetime import datetime

# load_dotenv()
# API_KEY = os.getenv("UNCLOTHY_API_KEY")

# BASE_URL = "https://unclothy.com/api/v2"
# HEADERS = {
#     "x-api-key": "b17c2e77-27f3-447a-a649-43a5c0e8d1e9",
#     "Content-Type": "application/json"
# }

# MAX_IMAGE_SIZE_MB = 5
# MAX_CONCURRENT_REQUESTS = 10  # Limit concurrent processing

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Track active requests for monitoring
# active_requests: Dict[str, dict] = {}
# request_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

# # Define request/response models
# class ImageRequest(BaseModel):
#     base64_image: str

# class TaskStatusResponse(BaseModel):
#     task_id: str
#     status: str
#     url: Optional[str] = None
#     progress: int = 0

# # --------------------------------------------------
# # 1. Validate Image (< 5MB)
# # --------------------------------------------------
# def validate_image(image_data: bytes):
#     try:
#         image = Image.open(BytesIO(image_data))
#         image.verify()
#     except Exception:
#         raise ValueError("Invalid image file")

#     size_mb = len(image_data) / (1024 * 1024)
#     if size_mb > MAX_IMAGE_SIZE_MB:
#         raise ValueError(f"Image size ({size_mb:.2f}MB) exceeds 5MB limit")


# # --------------------------------------------------
# # 2. Async Check Credits
# # --------------------------------------------------
# async def check_credits() -> int:
#     url = f"{BASE_URL}/user/credits"
    
#     async with httpx.AsyncClient(timeout=30.0) as client:
#         response = await client.get(url, headers=HEADERS)
#         response.raise_for_status()
#         data = response.json()

#     print(f"[{datetime.now()}] Credits API response:", data)

#     if "result" in data and "credits" in data["result"]:
#         return data["result"]["credits"]
#     else:
#         raise KeyError("The expected 'credits' field is missing in the API response")


# # --------------------------------------------------
# # 3. Async Create Task
# # --------------------------------------------------
# async def create_task(base64_image: str, settings: dict) -> str:
#     url = f"{BASE_URL}/task/create"
#     payload = {
#         "base64": base64_image,
#         "settings": settings
#     }

#     print(f"[{datetime.now()}] Creating task...")
    
#     async with httpx.AsyncClient(timeout=60.0) as client:
#         try:
#             response = await client.post(url, json=payload, headers=HEADERS)
#             response.raise_for_status()
#         except httpx.HTTPStatusError as e:
#             print(f"[ERROR] HTTP Error: {e}")
#             print(f"[ERROR] Response status: {response.status_code}")
#             print(f"[ERROR] Response body: {response.text}")
#             raise HTTPException(
#                 status_code=response.status_code,
#                 detail=f"Failed to create task: {response.text}"
#             )
    
#     data = response.json()
#     print(f"[{datetime.now()}] Create Task API response:", data)

#     if "result" in data and "task_id" in data["result"]:
#         return data["result"]["task_id"]
#     else:
#         raise KeyError("The expected 'task_id' field is missing in the API response")


# # --------------------------------------------------
# # 4. Async Poll Task Result (NON-BLOCKING)
# # --------------------------------------------------
# async def poll_task(task_id: str, timeout=240, interval=10, max_trials=24):
#     url = f"{BASE_URL}/task/{task_id}"
#     poll_headers = {
#         "x-api-key": HEADERS["x-api-key"],
#         "Content-Type": "application/json"
#     }
#     start = time.time()
#     trials = 0

#     async with httpx.AsyncClient(timeout=30.0) as client:
#         while True:
#             if trials >= max_trials:
#                 raise TimeoutError(f"Maximum polling trials reached (24) for task {task_id}")

#             if time.time() - start > timeout:
#                 raise TimeoutError(f"Task polling timed out for task {task_id}")

#             try:
#                 response = await client.get(url, headers=poll_headers)
#                 response.raise_for_status()
#                 data = response.json()

#                 print(f"[{datetime.now()}] Task {task_id} polling response:", data)

#                 status = data.get("result", {}).get("status")

#                 if status == "completed":
#                     return data["result"]

#                 if status == "failed":
#                     raise RuntimeError(f"Task {task_id} failed")

#                 # Update progress tracking
#                 if task_id in active_requests:
#                     progress = min(95, 10 + (trials * 3))  # Simulate progress
#                     active_requests[task_id]["progress"] = progress
#                     active_requests[task_id]["status"] = status

#             except httpx.HTTPStatusError as e:
#                 print(f"[ERROR] Polling error for task {task_id}: {e}")
#                 if e.response.status_code == 404:
#                     raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
#                 raise

#             trials += 1
#             await asyncio.sleep(interval)  # NON-BLOCKING SLEEP!


# # --------------------------------------------------
# # 5. Async Full Pipeline
# # --------------------------------------------------
# async def generate(base64_image: str, task_id: str):
#     try:
#         # Check credits
#         credits = await check_credits()
#         if credits < 1:
#             raise RuntimeError("Insufficient credits")

#         # Static settings for now (you can make this dynamic)
#         settings = {
#             "generationMode": "naked",
#             "gender": "female",
#             "age": "automatic",
#             "bodyType": "skinny",
#             "breastsSize": "small",
#             "assSize": "small",
#             "pussy": "shaved",
#             "penis": "shaved"
#         }

#         # Create task
#         api_task_id = await create_task(base64_image, settings)
#         print(f"[{datetime.now()}] Task ID: {api_task_id}")
        
#         # Update tracking
#         active_requests[task_id]["api_task_id"] = api_task_id
#         active_requests[task_id]["status"] = "processing"

#         # Poll for result (non-blocking)
#         result = await poll_task(api_task_id)
        
#         # Update tracking
#         active_requests[task_id]["status"] = "completed"
#         active_requests[task_id]["result"] = result
#         active_requests[task_id]["progress"] = 100
        
#         return result

#     except Exception as e:
#         print(f"[ERROR] Generation failed for task {task_id}: {e}")
#         active_requests[task_id]["status"] = "failed"
#         active_requests[task_id]["error"] = str(e)
#         raise


# # --------------------------------------------------
# # FastAPI Endpoints
# # --------------------------------------------------

# @app.get("/")
# async def root():
#     return {
#         "status": "API is running",
#         "message": "Backend is operational",
#         "active_requests": len(active_requests),
#         "max_concurrent": MAX_CONCURRENT_REQUESTS
#     }

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "timestamp": time.time(),
#         "active_requests": len(active_requests)
#     }

# @app.get("/stats")
# async def get_stats():
#     """Monitor active requests"""
#     return {
#         "active_requests": len(active_requests),
#         "max_concurrent": MAX_CONCURRENT_REQUESTS,
#         "tasks": {
#             task_id: {
#                 "status": info.get("status"),
#                 "progress": info.get("progress", 0),
#                 "started_at": info.get("started_at")
#             }
#             for task_id, info in active_requests.items()
#         }
#     }

# @app.post("/generate-image/")
# async def generate_image(request: ImageRequest, background_tasks: BackgroundTasks):
#     """Main endpoint with concurrent support"""
    
#     # Check if server is at capacity
#     if len(active_requests) >= MAX_CONCURRENT_REQUESTS * 2:
#         raise HTTPException(
#             status_code=503,
#             detail="Server is at capacity. Please try again in a few moments."
#         )
    
#     # Generate unique task ID
#     task_id = f"task_{int(time.time() * 1000)}"
    
#     try:
#         print(f"[{datetime.now()}] New request - Task ID: {task_id}")
        
#         # Decode and validate image
#         try:
#             image_data = base64.b64decode(request.base64_image)
#             validate_image(image_data)
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

#         # Initialize tracking
#         active_requests[task_id] = {
#             "status": "initializing",
#             "progress": 0,
#             "started_at": datetime.now().isoformat()
#         }

#         # Acquire semaphore to limit concurrency
#         async with request_semaphore:
#             print(f"[{datetime.now()}] Processing task {task_id} (Active: {len(active_requests)})")
            
#             # Call async generate pipeline
#             result = await generate(request.base64_image, task_id)

#         # Construct response
#         response = {
#             "success": True,
#             "status_code": 200,
#             "status_text": "OK",
#             "message": "Task data retrieved successfully.",
#             "result": {
#                 "task_id": result["task_id"],
#                 "status": result["status"],
#                 "url": result["url"],
#                 "elapsed_time": result["elapsed_time"],
#                 "expiration_date": result["expiration_date"]
#             }
#         }
        
#         # Clean up tracking after delay
#         background_tasks.add_task(cleanup_task, task_id, delay=300)  # 5 min cleanup
        
#         print(f"[{datetime.now()}] Task {task_id} completed successfully")
#         return response

#     except HTTPException:
#         # Clean up and re-raise HTTP exceptions
#         if task_id in active_requests:
#             del active_requests[task_id]
#         raise
    
#     except Exception as e:
#         print(f"[ERROR] Task {task_id} failed: {str(e)}")
#         if task_id in active_requests:
#             del active_requests[task_id]
#         raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")


# async def cleanup_task(task_id: str, delay: int = 300):
#     """Clean up old task data after delay"""
#     await asyncio.sleep(delay)
#     if task_id in active_requests:
#         del active_requests[task_id]
#         print(f"[{datetime.now()}] Cleaned up task {task_id}")


# # --------------------------------------------------
# # Run with: uvicorn main:app --host 0.0.0.0 --port 8003
# # For production: uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4
# # --------------------------------------------------

import os
import time
import base64
import asyncio
import httpx
import uuid
import asyncpg
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header
from pydantic import BaseModel
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
from datetime import datetime
from jose import jwt, JWTError, ExpiredSignatureError

load_dotenv()

# ================= CONFIG ================= #
API_KEY = os.getenv("UNCLOTHY_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

BASE_URL = "https://unclothy.com/api/v2"
HEADERS = {
    "x-api-key": "674cdde5-0af3-4dee-9327-84aa608f2edd",
    "Content-Type": "application/json"
}

MAX_IMAGE_SIZE_MB = 5
MAX_CONCURRENT_REQUESTS = 10

app = FastAPI(title="Generation API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track active requests for monitoring
active_requests: Dict[str, dict] = {}
request_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

# ================= DATABASE ================= #
async def get_db():
    """Get database connection"""
    return await asyncpg.connect(DATABASE_URL, ssl="require")

# ================= AUTHENTICATION ================= #
def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate JWT token"""
    print(f"[DEBUG] Authorization header: {authorization}")
    
    if not authorization or not authorization.startswith("Bearer "):
        print(f"[DEBUG] Invalid authorization format")
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": "Invalid authorization header. Please log in again."
            }
        )

    token = authorization.split(" ", 1)[1]
    print(f"[DEBUG] Extracted token: {token[:50]}...")

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "iss"]},
        )
        user_id = payload["sub"]
        print(f"[DEBUG] Token validated successfully. User ID: {user_id}")
        return user_id
    except ExpiredSignatureError:
        print(f"[DEBUG] Token expired")
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Token Expired",
                "message": "Your session has expired. Please log in again."
            }
        )
    except JWTError as e:
        print(f"[DEBUG] JWT Error: {e}")
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Invalid Token",
                "message": "Authentication failed. Please log in again."
            }
        )

# ================= CREDIT MANAGEMENT ================= #
async def check_user_credits(user_id: str) -> int:
    """Check user's credit balance from database"""
    conn = await get_db()
    try:
        result = await conn.fetchrow(
            """
            SELECT balance 
            FROM wallets 
            WHERE user_id = $1
            """,
            uuid.UUID(user_id)
        )
        
        if not result:
            print(f"[WARNING] No wallet found for user {user_id}")
            return 0
        
        balance = result["balance"]
        print(f"[{datetime.now()}] User {user_id} has {balance} credits")
        return balance
        
    except Exception as e:
        print(f"[ERROR] Failed to check credits for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Database Error",
                "message": "Failed to verify your credit balance. Please try again."
            }
        )
    finally:
        await conn.close()

async def deduct_credits(user_id: str, amount: int = 1, reference_id: str = None):
    """Deduct credits from user's wallet and log transaction"""
    conn = await get_db()
    try:
        async with conn.transaction():
            # Check current balance
            wallet = await conn.fetchrow(
                "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE",
                uuid.UUID(user_id)
            )
            
            if not wallet:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "Wallet Not Found",
                        "message": "Your wallet could not be found. Please contact support."
                    }
                )
            
            current_balance = wallet["balance"]
            
            if current_balance < amount:
                raise HTTPException(
                    status_code=402,
                    detail={
                        "error": "Insufficient Credits",
                        "message": f"You need {amount} credit(s) but only have {current_balance}. Please purchase more credits.",
                        "current_credits": current_balance,
                        "required_credits": amount
                    }
                )
            
            # Deduct credits
            new_balance = await conn.fetchval(
                """
                UPDATE wallets 
                SET balance = balance - $1, updated_at = $2
                WHERE user_id = $3
                RETURNING balance
                """,
                amount,
                datetime.utcnow(),
                uuid.UUID(user_id)
            )
            
            # Log transaction
            await conn.execute(
                """
                INSERT INTO credit_ledger 
                (id, user_id, type, amount, reference_id, created_at)
                VALUES ($1, $2, 'DEDUCT', $3, $4, $5)
                """,
                uuid.uuid4(),
                uuid.UUID(user_id),
                -amount,
                reference_id or f"generation_{int(time.time())}",
                datetime.utcnow()
            )
            
            print(f"[{datetime.now()}] Deducted {amount} credit(s) from user {user_id}. New balance: {new_balance}")
            return new_balance
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to deduct credits for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Transaction Failed",
                "message": "Failed to process credit deduction. Your credits were not charged."
            }
        )
    finally:
        await conn.close()

async def refund_credits(user_id: str, amount: int = 1, reason: str = "refund"):
    """Refund credits to user's wallet (e.g., if generation fails)"""
    conn = await get_db()
    try:
        async with conn.transaction():
            new_balance = await conn.fetchval(
                """
                UPDATE wallets 
                SET balance = balance + $1, updated_at = $2
                WHERE user_id = $3
                RETURNING balance
                """,
                amount,
                datetime.utcnow(),
                uuid.UUID(user_id)
            )
            
            # Log refund
            await conn.execute(
                """
                INSERT INTO credit_ledger 
                (id, user_id, type, amount, reference_id, created_at)
                VALUES ($1, $2, 'REFUND', $3, $4, $5)
                """,
                uuid.uuid4(),
                uuid.UUID(user_id),
                amount,
                reason,
                datetime.utcnow()
            )
            
            print(f"[{datetime.now()}] Refunded {amount} credit(s) to user {user_id}. New balance: {new_balance}")
            return new_balance
            
    except Exception as e:
        print(f"[ERROR] Failed to refund credits for user {user_id}: {e}")
    finally:
        await conn.close()

# ================= MODELS ================= #
class ImageRequest(BaseModel):
    base64_image: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    url: Optional[str] = None
    progress: int = 0

# ================= VALIDATION ================= #
def validate_image(image_data: bytes):
    try:
        image = Image.open(BytesIO(image_data))
        image.verify()
    except Exception:
        raise ValueError("Invalid image file")

    size_mb = len(image_data) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise ValueError(f"Image size ({size_mb:.2f}MB) exceeds 5MB limit")

# ================= UNCLOTHY API ================= #
async def create_task(base64_image: str, settings: dict) -> str:
    url = f"{BASE_URL}/task/create"
    payload = {
        "base64": base64_image,
        "settings": settings
    }

    print(f"[{datetime.now()}] Creating task...")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=payload, headers=HEADERS)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            print(f"[ERROR] HTTP Error: {e}")
            print(f"[ERROR] Response status: {response.status_code}")
            print(f"[ERROR] Response body: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to create task: {response.text}"
            )
    
    data = response.json()
    print(f"[{datetime.now()}] Create Task API response:", data)

    if "result" in data and "task_id" in data["result"]:
        return data["result"]["task_id"]
    else:
        raise KeyError("The expected 'task_id' field is missing in the API response")

async def poll_task(task_id: str, timeout=240, interval=10, max_trials=24):
    url = f"{BASE_URL}/task/{task_id}"
    poll_headers = {
        "x-api-key": HEADERS["x-api-key"],
        "Content-Type": "application/json"
    }
    start = time.time()
    trials = 0

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            if trials >= max_trials:
                raise TimeoutError(f"Maximum polling trials reached (24) for task {task_id}")

            if time.time() - start > timeout:
                raise TimeoutError(f"Task polling timed out for task {task_id}")

            try:
                response = await client.get(url, headers=poll_headers)
                response.raise_for_status()
                data = response.json()

                print(f"[{datetime.now()}] Task {task_id} polling response:", data)

                status = data.get("result", {}).get("status")

                if status == "completed":
                    return data["result"]

                if status == "failed":
                    raise RuntimeError(f"Task {task_id} failed")

                # Update progress tracking
                if task_id in active_requests:
                    progress = min(95, 10 + (trials * 3))
                    active_requests[task_id]["progress"] = progress
                    active_requests[task_id]["status"] = status

            except httpx.HTTPStatusError as e:
                print(f"[ERROR] Polling error for task {task_id}: {e}")
                if e.response.status_code == 404:
                    raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
                raise

            trials += 1
            await asyncio.sleep(interval)

# ================= GENERATION PIPELINE ================= #
async def generate(base64_image: str, task_id: str, user_id: str):
    credits_deducted = False
    
    try:
        # Check credits from database
        current_credits = await check_user_credits(user_id)
        
        if current_credits <= 0:
            print(f"[{datetime.now()}] Insufficient credits for user {user_id}: {current_credits}")
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "Insufficient Credits",
                    "message": "You don't have enough credits to generate images. Please purchase more credits to continue.",
                    "current_credits": current_credits,
                    "required_credits": 1
                }
            )

        print(f"[{datetime.now()}] User {user_id} has {current_credits} credits - Proceeding with generation")

        # Deduct credits BEFORE processing
        await deduct_credits(user_id, amount=1, reference_id=task_id)
        credits_deducted = True

        # Static settings (make this dynamic based on user input later)
        settings = {
            "generationMode": "naked",
            "gender": "female",
            "age": "automatic",
            "bodyType": "skinny",
            "breastsSize": "large",
            "assSize": "small",
            "pussy": "shaved",
            "penis": "shaved"
        }

        # Create task
        api_task_id = await create_task(base64_image, settings)
        print(f"[{datetime.now()}] Task ID: {api_task_id}")
        
        # Update tracking
        active_requests[task_id]["api_task_id"] = api_task_id
        active_requests[task_id]["status"] = "processing"

        # Poll for result
        result = await poll_task(api_task_id)
        
        # Update tracking
        active_requests[task_id]["status"] = "completed"
        active_requests[task_id]["result"] = result
        active_requests[task_id]["progress"] = 100
        
        return result

    except HTTPException:
        # If credits were deducted but generation failed, refund
        if credits_deducted and active_requests.get(task_id, {}).get("status") != "completed":
            print(f"[{datetime.now()}] Refunding credits to user {user_id} due to error")
            await refund_credits(user_id, amount=1, reason=f"failed_{task_id}")
        raise
    
    except Exception as e:
        print(f"[ERROR] Generation failed for task {task_id}: {e}")
        
        # Refund credits on failure
        if credits_deducted:
            print(f"[{datetime.now()}] Refunding credits to user {user_id} due to failure")
            await refund_credits(user_id, amount=1, reason=f"error_{task_id}")
        
        active_requests[task_id]["status"] = "failed"
        active_requests[task_id]["error"] = str(e)
        raise

# ================= ENDPOINTS ================= #
@app.get("/")
async def root():
    return {
        "status": "Generation API running",
        "message": "Backend is operational",
        "active_requests": len(active_requests),
        "max_concurrent": MAX_CONCURRENT_REQUESTS
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_requests": len(active_requests)
    }

@app.get("/stats")
async def get_stats():
    """Monitor active requests"""
    return {
        "active_requests": len(active_requests),
        "max_concurrent": MAX_CONCURRENT_REQUESTS,
        "tasks": {
            task_id: {
                "status": info.get("status"),
                "progress": info.get("progress", 0),
                "started_at": info.get("started_at")
            }
            for task_id, info in active_requests.items()
        }
    }

@app.get("/credits")
async def get_credits(user_id: str = Depends(get_current_user)):
    """Check available credits for authenticated user"""
    try:
        credits = await check_user_credits(user_id)
        return {
            "success": True,
            "status_code": 200,
            "message": "Credits retrieved successfully",
            "user_id": user_id,
            "credits": credits,
            "sufficient": credits > 0
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Credits Check Failed",
                "message": f"Unable to retrieve credits: {str(e)}"
            }
        )

@app.post("/generate-image/")
async def generate_image(
    request: ImageRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    """Main endpoint with authentication and database credit checking"""
    
    # Check if server is at capacity
    if len(active_requests) >= MAX_CONCURRENT_REQUESTS * 2:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Server At Capacity",
                "message": "The server is currently handling maximum requests. Please try again in a few moments.",
                "active_requests": len(active_requests),
                "max_capacity": MAX_CONCURRENT_REQUESTS * 2
            }
        )
    
    # Generate unique task ID
    task_id = f"task_{int(time.time() * 1000)}"
    
    try:
        print(f"[{datetime.now()}] New request from user {user_id} - Task ID: {task_id}")
        
        # Decode and validate image
        try:
            image_data = base64.b64decode(request.base64_image)
            validate_image(image_data)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid Image",
                    "message": str(e)
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Image Processing Error",
                    "message": f"Failed to process image: {str(e)}"
                }
            )

        # Initialize tracking
        active_requests[task_id] = {
            "user_id": user_id,
            "status": "initializing",
            "progress": 0,
            "started_at": datetime.now().isoformat()
        }

        # Acquire semaphore to limit concurrency
        async with request_semaphore:
            print(f"[{datetime.now()}] Processing task {task_id} for user {user_id} (Active: {len(active_requests)})")
            
            # Call async generate pipeline with database credit checking
            result = await generate(request.base64_image, task_id, user_id)

        # Construct response
        response = {
            "success": True,
            "status_code": 200,
            "status_text": "OK",
            "message": "Task data retrieved successfully.",
            "result": {
                "task_id": result["task_id"],
                "status": result["status"],
                "url": result["url"],
                "elapsed_time": result["elapsed_time"],
                "expiration_date": result["expiration_date"]
            },
            "credits_remaining": await check_user_credits(user_id)
        }
        
        # Clean up tracking after delay
        background_tasks.add_task(cleanup_task, task_id, delay=300)
        
        print(f"[{datetime.now()}] Task {task_id} completed successfully for user {user_id}")
        return response

    except HTTPException:
        # Clean up and re-raise HTTP exceptions
        if task_id in active_requests:
            del active_requests[task_id]
        raise
    
    except Exception as e:
        print(f"[ERROR] Task {task_id} failed: {str(e)}")
        if task_id in active_requests:
            del active_requests[task_id]
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal Server Error",
                "message": f"An unexpected error occurred: {str(e)}"
            }
        )

async def cleanup_task(task_id: str, delay: int = 300):
    """Clean up old task data after delay"""
    await asyncio.sleep(delay)
    if task_id in active_requests:
        del active_requests[task_id]
        print(f"[{datetime.now()}] Cleaned up task {task_id}")

# ================= RUN ================= #
# uvicorn main:app --host 0.0.0.0 --port 8003 --reload
# For production: uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4