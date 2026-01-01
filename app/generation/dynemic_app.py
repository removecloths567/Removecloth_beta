# import os
# import time
# import base64
# import asyncio
# import httpx
# import uuid
# import asyncpg
# from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header
# from pydantic import BaseModel, Field
# from dotenv import load_dotenv
# from io import BytesIO
# from PIL import Image
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Dict, Optional
# from datetime import datetime
# from jose import jwt, JWTError, ExpiredSignatureError
# from enum import Enum
# from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
# from slowapi import Limiter, _rate_limit_exceeded_handler # type: ignore
# from slowapi.util import get_remote_address # type: ignore
# from slowapi.errors import RateLimitExceeded # type: ignore
# from fastapi import Request
# from pydantic import ValidationError
# import logging

# logger = logging.getLogger("uvicorn")
# logger.setLevel(logging.DEBUG)  # This ensures DEBUG and higher logs are captured
# logging.basicConfig(level=logging.DEBUG) 
# load_dotenv()

# class GenerationMode(str, Enum):
#     NAKED = "naked"
#     BONDAGE = "bondage"
#     SWIMSUIT = "swimsuit"
#     UNDERWEAR  = "underwear"
#     LATEX = "latex"

# class Gender(str, Enum):
#     MALE = "male"
#     FEMALE = "female"

# class BodyType(str, Enum):
#     SKINNY = "skinny"
#     FIT = "fit"
#     CURVY = "curvy"
#     MUSCULAR =  "muscular"

# class Size(str, Enum):
#     SMALL = "small"
#     MEDIUM = "medium"
#     LARGE = "large"

# class GenerationSettings(BaseModel):
#     generationMode: GenerationMode
#     gender: Gender
#     age: str = Field(..., pattern="^(automatic|18|25|35|45|60)$")
#     bodyType: BodyType
#     breastsSize: Size
#     assSize: Size
#     pussy: str = Field(..., pattern="^(shaved|normal|hairy)$")
#     penis: str = Field(..., pattern="^(shaved|normal|hairy)$")

# class ImageRequest(BaseModel):
#     base64_image: str

# class ImageWithSettings(BaseModel):
#     base64_image: str

# class GenerateImagePayload(BaseModel):
#     request: ImageWithSettings
#     settings: GenerationSettings


# class TaskStatusResponse(BaseModel):
#     task_id: str
#     status: str
#     url: Optional[str] = None
#     progress: int = 0

# API_KEY = "7973c863-dbab-4f51-8fd6-85726afbea80"
# SECRET_KEY = os.getenv("SECRET_KEY")
# DATABASE_URL = os.getenv("DATABASE_URL")
# # ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
# ALGORITHM = "HS256"

# if not SECRET_KEY:
#     raise RuntimeError("SECRET_KEY not set")
# if not DATABASE_URL:
#     raise RuntimeError("DATABASE_URL not set")
# if not API_KEY:
#     raise RuntimeError("UNCLOTHY_API_KEY not set")

# BASE_URL = "https://unclothy.com/api/v2"
# HEADERS = {
#     "x-api-key": API_KEY,
#     "Content-Type": "application/json"
# }

# MAX_IMAGE_SIZE_MB = 5
# MAX_CONCURRENT_REQUESTS = 10
# MAX_BASE64_SIZE = 7_000_000

# app = FastAPI(title="Generation API", version="2.0.0")

# limiter = Limiter(key_func=get_remote_address)
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# from fastapi.exceptions import RequestValidationError
# from fastapi.responses import JSONResponse

# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     # Log the validation error details
#     # logger.error(f"Validation error for request: {request.url}")
#     # logger.error(f"Request body: {await request.body()}")
#     # logger.error(f"Validation errors: {exc.errors()}")
    
#     return JSONResponse(
#         status_code=422,
#         content={
#             "detail": exc.errors(),
#             "body": str(exc.body) if hasattr(exc, 'body') else None
#         }
#     )
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["GET", "POST"],
#     allow_headers=["Authorization", "Content-Type"],
# )

# db_pool = None


# @app.on_event("startup")
# async def startup():
#     global db_pool
#     db_pool = await asyncpg.create_pool(
#         DATABASE_URL,
#         min_size=10,
#         max_size=50,
#         command_timeout=60,
#         statement_cache_size=0
#     )

# @app.on_event("shutdown")
# async def shutdown():
#     global db_pool
#     if db_pool:
#         await db_pool.close()

# def safe_uuid(user_id: str) -> uuid.UUID:
#     try:
#         return uuid.UUID(user_id)
#     except (ValueError, AttributeError, TypeError):
#         raise HTTPException(status_code=400, detail="Invalid user ID format")

# def get_current_user(authorization: Optional[str] = Header(None)) -> str:
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(
#             status_code=401,
#             detail={
#                 "error": "Unauthorized",
#                 "message": "Invalid authorization header. Please log in again."
#             }
#         )

#     token = authorization.split(" ", 1)[1]

#     try:
#         payload = jwt.decode(
#             token,
#             SECRET_KEY,
#             algorithms=[ALGORITHM],
#             options={"require": ["exp", "iat", "sub", "iss"]},
#         )
#         return payload["sub"]
#     except ExpiredSignatureError:
#         raise HTTPException(
#             status_code=401,
#             detail={
#                 "error": "Token Expired",
#                 "message": "Your session has expired. Please log in again."
#             }
#         )
#     except JWTError:
#         raise HTTPException(
#             status_code=401,
#             detail={
#                 "error": "Invalid Token",
#                 "message": "Authentication failed. Please log in again."
#             }
#         )

# def validate_image(image_data: bytes):
#     try:
#         image = Image.open(BytesIO(image_data))
#         image.verify()
#     except Exception:
#         raise ValueError("Invalid image file")

#     size_mb = len(image_data) / (1024 * 1024)
#     if size_mb > MAX_IMAGE_SIZE_MB:
#         raise ValueError(f"Image size ({size_mb:.2f}MB) exceeds 5MB limit")

# @retry(
#     stop=stop_after_attempt(3),
#     wait=wait_exponential(multiplier=1, min=2, max=10),
#     retry=retry_if_exception_type(httpx.HTTPStatusError),
#     reraise=True
# )
# async def create_task(base64_image: str, settings: dict) -> str:
#     url = f"{BASE_URL}/task/create"
#     payload = {
#         "base64": base64_image,
#         "settings": settings
#     }
    
#     timeout = httpx.Timeout(connect=5.0, read=60.0, write=30.0, pool=5.0)
    
#     async with httpx.AsyncClient(timeout=timeout) as client:
#         response = await client.post(url, json=payload, headers=HEADERS)
#         response.raise_for_status()
    
#     data = response.json()

#     if "result" in data and "task_id" in data["result"]:
#         return data["result"]["task_id"]
#     else:
#         raise KeyError("Task ID missing in API response")

# async def poll_task(task_id: str, timeout=240, interval=10, max_trials=24):
#     url = f"{BASE_URL}/task/{task_id}"
#     start = time.time()
#     trials = 0

#     timeout_config = httpx.Timeout(connect=5.0, read=30.0, write=30.0, pool=5.0)
    
#     async with httpx.AsyncClient(timeout=timeout_config) as client:
#         while True:
#             if trials >= max_trials:
#                 raise TimeoutError(f"Maximum polling trials reached for task {task_id}")

#             if time.time() - start > timeout:
#                 raise TimeoutError(f"Task polling timed out for task {task_id}")

#             try:
#                 response = await client.get(url, headers=HEADERS)
#                 response.raise_for_status()
#                 data = response.json()

#                 status = data.get("result", {}).get("status")

#                 if status == "completed":
#                     return data["result"]

#                 if status == "failed":
#                     raise RuntimeError(f"Task {task_id} failed")

#                 if task_id in active_requests:
#                     progress = min(95, 10 + (trials * 3))
#                     active_requests[task_id]["progress"] = progress
#                     active_requests[task_id]["status"] = status

#             except httpx.HTTPStatusError as e:
#                 if e.response.status_code == 404:
#                     raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
#                 raise

#             trials += 1
#             await asyncio.sleep(interval)

# async def check_user_credits(user_id: str) -> int:
#     async with db_pool.acquire() as conn:
#         try:
#             result = await conn.fetchrow(
#                 "SELECT balance FROM wallets WHERE user_id = $1",
#                 safe_uuid(user_id)
#             )
#             return result["balance"] if result else 0
#         except Exception:
#             raise HTTPException(status_code=500, detail="Database error")

# async def refund_credits(user_id: str, amount: int = 1, reason: str = "refund"):
#     async with db_pool.acquire() as conn:
#         try:
#             async with conn.transaction():
#                 await conn.fetchval(
#                     "UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE user_id = $3 RETURNING balance",
#                     amount,
#                     datetime.utcnow(),
#                     safe_uuid(user_id)
#                 )
                
#                 await conn.execute(
#                     "INSERT INTO credit_ledger (id, user_id, type, amount, reference_id, created_at) VALUES ($1, $2, 'REFUND', $3, $4, $5)",
#                     uuid.uuid4(),
#                     safe_uuid(user_id),
#                     amount,
#                     reason,
#                     datetime.utcnow()
#                 )
#         except Exception as e:
#             logger.error(f"Failed to refund credits: {str(e)}")

# async def generate(base64_image: str, task_id: str, user_id: str, settings: GenerationSettings):
#     credits_deducted = False
#     api_task_id = None
    
#     try:
#         # Use context manager instead of manual acquire/release
#         async with db_pool.acquire() as conn:
#             async with conn.transaction():
#                 wallet = await conn.fetchrow(
#                     "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE",
#                     safe_uuid(user_id)
#                 )
                
#                 if not wallet or wallet["balance"] < 1:
#                     raise HTTPException(
#                         status_code=402,
#                         detail={
#                             "error": "Insufficient Credits",
#                             "message": "Please purchase more credits.",
#                             "current_credits": wallet["balance"] if wallet else 0
#                         }
#                     )
                
#                 await conn.execute(
#                     "UPDATE wallets SET balance = balance - 1, updated_at = $1 WHERE user_id = $2",
#                     datetime.utcnow(),
#                     safe_uuid(user_id)
#                 )
                
#                 await conn.execute(
#                     "INSERT INTO credit_ledger (id, user_id, type, amount, reference_id, created_at) VALUES ($1, $2, 'DEDUCT', -1, $3, $4)",
#                     uuid.uuid4(),
#                     safe_uuid(user_id),
#                     task_id,
#                     datetime.utcnow()
#                 )
                
#                 credits_deducted = True
        
#         # Connection automatically released here

#         logger.debug(f"Creating task with settings: {settings.dict()}")
#         api_task_id = await create_task(base64_image, settings.dict())
#         logger.debug(f"Created API task ID: {api_task_id}")
        
#         active_requests[task_id]["api_task_id"] = api_task_id
#         active_requests[task_id]["status"] = "processing"

#         logger.debug(f"Starting to poll task: {api_task_id}")
#         result = await poll_task(api_task_id)
#         logger.debug(f"Poll task completed with result: {result}")
        
#         active_requests[task_id]["status"] = "completed"
#         active_requests[task_id]["result"] = result
#         active_requests[task_id]["progress"] = 100
        
#         return result

#     except HTTPException:
#         logger.error(f"HTTPException in generate for task {task_id}")
#         raise
#     except Exception as e:
#         logger.error(f"Exception in generate for task {task_id}: {str(e)}", exc_info=True)
        
#         if credits_deducted and not api_task_id:
#             await refund_credits(user_id, amount=1, reason=f"failed_{task_id}")
        
#         if task_id in active_requests:
#             active_requests[task_id]["status"] = "failed"
        
#         raise

# @app.get("/")
# async def root():
#     return {
#         "status": "Generation API running",
#         "message": "Backend is operational",
#         "active_requests": len(active_requests),
#         "max_concurrent": MAX_CONCURRENT_REQUESTS
#     }

# @app.get("/health")
# async def health_check():
#     health_status = {
#         "status": "healthy",
#         "timestamp": time.time(),
#         "active_requests": len(active_requests)
#     }
    
#     conn = await db_pool.acquire()
#     try:
#         await conn.fetchval("SELECT 1")
#         health_status["database"] = "connected"
#     except Exception:
#         health_status["database"] = "disconnected"
#         health_status["status"] = "unhealthy"
#         raise HTTPException(status_code=503, detail=health_status)
#     finally:
#         await db_pool.release(conn)
    
#     return health_status

# @app.get("/stats")
# async def get_stats():
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

# @app.get("/credits")
# @limiter.limit("60/minute")
# async def get_credits(request: Request,user_id: str = Depends(get_current_user)):
#     try:
#         credits = await check_user_credits(user_id)
#         return {
#             "success": True,
#             "status_code": 200,
#             "message": "Credits retrieved successfully",
#             "user_id": user_id,
#             "credits": credits,
#             "sufficient": credits > 0
#         }
#     except HTTPException:
#         raise
#     except Exception:
#         raise HTTPException(status_code=500, detail="Unable to retrieve credits")

# class ImageWithSettings(BaseModel):
#     base64_image: str

# class GenerateImagePayload(BaseModel):
#     request: ImageWithSettings
#     settings: GenerationSettings




# import asyncio
# from typing import Dict, Optional

# # At the top with other globals
# active_requests: Dict[str, dict] = {}
# request_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
# active_requests_lock = asyncio.Lock()  # Add this new lock

# # Update the generate_image endpoint
# @app.post("/generate-image/")
# @limiter.limit("10/minute")
# async def generate_image(
#     request: Request,
#     payload: GenerateImagePayload,
#     background_tasks: BackgroundTasks,
#     user_id: str = Depends(get_current_user)
# ):  
#     base64_image = payload.request.base64_image
#     settings = payload.settings
    
#     if len(base64_image) > MAX_BASE64_SIZE:
#         raise HTTPException(status_code=400, detail="Image too large. Maximum size is 5MB.")
    
#     # Thread-safe check with lock
#     async with active_requests_lock:
#         if len(active_requests) >= MAX_CONCURRENT_REQUESTS * 2:
#             raise HTTPException(
#                 status_code=503, 
#                 detail="Server is at capacity. Please try again later."
#             )
        
#         # Generate task_id inside the lock to ensure uniqueness
#         task_id = f"task_{uuid.uuid4().hex[:16]}_{int(time.time() * 1000)}"
        
#         # Reserve the slot immediately
#         active_requests[task_id] = {
#             "user_id": user_id,
#             "status": "initializing",
#             "progress": 0,
#             "started_at": datetime.now().isoformat()
#         }
    
#     try:
#         try:
#             image_data = base64.b64decode(base64_image)
#             validate_image(image_data)
#         except ValueError as e:
#             # Clean up on validation failure
#             async with active_requests_lock:
#                 del active_requests[task_id]
#             raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

#         async with request_semaphore:
#             result = await generate(base64_image, task_id, user_id, settings)

#         logger.debug(f"Generation result: {result}")

#         response = {
#             "success": True,
#             "status_code": 200,
#             "status_text": "OK",
#             "message": "Task data retrieved successfully.",
#             "result": {
#                 "task_id": result.get("task_id", ""),
#                 "status": result.get("status", "completed"),
#                 "url": result.get("url", ""),
#                 "elapsed_time": result.get("elapsed_time", 0),
#                 "expiration_date": result.get("expiration_date", "")
#             },
#             "credits_remaining": await check_user_credits(user_id)
#         }

#         background_tasks.add_task(cleanup_task, task_id, delay=300)
        
#         return response

#     except HTTPException:
#         async with active_requests_lock:
#             if task_id in active_requests:
#                 del active_requests[task_id]
#         raise
#     except Exception as e:
#         logger.error(f"Error in generate_image: {str(e)}", exc_info=True)
#         async with active_requests_lock:
#             if task_id in active_requests:
#                 del active_requests[task_id]
#         raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")

# # Also update cleanup_task to use the lock
# async def cleanup_task(task_id: str, delay: int = 300):
#     await asyncio.sleep(delay)
#     async with active_requests_lock:
#         if task_id in active_requests:
#             del active_requests[task_id]

import os
import time
import base64
import asyncio
import httpx
import uuid
import asyncpg
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image
from typing import Dict, Optional
from datetime import datetime
from jose import jwt, JWTError, ExpiredSignatureError
from enum import Enum
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# Logging setup
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)
load_dotenv()

# Enums
class GenerationMode(str, Enum):
    NAKED = "naked"
    BONDAGE = "bondage"
    SWIMSUIT = "swimsuit"
    UNDERWEAR = "underwear"
    LATEX = "latex"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class BodyType(str, Enum):
    SKINNY = "skinny"
    FIT = "fit"
    CURVY = "curvy"
    MUSCULAR = "muscular"

class Size(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

# Pydantic Models
class GenerationSettings(BaseModel):
    generationMode: GenerationMode
    gender: Gender
    age: str = Field(..., pattern="^(automatic|18|25|35|45|60)$")
    bodyType: BodyType
    breastsSize: Size
    assSize: Size
    pussy: str = Field(..., pattern="^(shaved|normal|hairy)$")
    penis: str = Field(..., pattern="^(shaved|normal|hairy)$")

class ImageWithSettings(BaseModel):
    base64_image: str

class GenerateImagePayload(BaseModel):
    request: ImageWithSettings
    settings: GenerationSettings

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    url: Optional[str] = None
    progress: int = 0

# Configuration
API_KEY = os.getenv("UNCLOTHY_API_KEY")  # ✅ FIXED: From environment
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")  # ✅ Configurable
ALGORITHM = "HS256"

# Validate required environment variables
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")
if not API_KEY:
    raise RuntimeError("UNCLOTHY_API_KEY not set")

BASE_URL = "https://unclothy.com/api/v2"
HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

MAX_IMAGE_SIZE_MB = 5
MAX_CONCURRENT_REQUESTS = 10
MAX_BASE64_SIZE = 7_000_000

# FastAPI app setup
app = FastAPI(title="Generation API", version="2.0.0")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error for request: {request.url}")
    logger.error(f"Validation errors: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": str(exc.body) if hasattr(exc, 'body') else None
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # ✅ FIXED: Configurable
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Global state - ✅ FIXED: Defined BEFORE use
active_requests: Dict[str, dict] = {}
request_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
active_requests_lock = asyncio.Lock()
db_pool = None

# Startup/Shutdown
@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=10,
        max_size=50,
        command_timeout=60,
        statement_cache_size=0
    )

@app.on_event("shutdown")
async def shutdown():
    global db_pool
    if db_pool:
        await db_pool.close()

# Utility functions
def safe_uuid(user_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(user_id)
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": "Invalid authorization header. Please log in again."
            }
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "iss"]},
        )
        return payload["sub"]
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Token Expired",
                "message": "Your session has expired. Please log in again."
            }
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Invalid Token",
                "message": "Authentication failed. Please log in again."
            }
        )

def validate_image(image_data: bytes):
    try:
        image = Image.open(BytesIO(image_data))
        image.verify()
    except Exception:
        raise ValueError("Invalid image file")

    size_mb = len(image_data) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise ValueError(f"Image size ({size_mb:.2f}MB) exceeds 5MB limit")

# API functions
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(httpx.HTTPStatusError),
    reraise=True
)
async def create_task(base64_image: str, settings: dict) -> str:
    url = f"{BASE_URL}/task/create"
    payload = {
        "base64": base64_image,
        "settings": settings
    }
    
    timeout = httpx.Timeout(connect=5.0, read=60.0, write=30.0, pool=5.0)
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, json=payload, headers=HEADERS)
        response.raise_for_status()
    
    data = response.json()

    if "result" in data and "task_id" in data["result"]:
        return data["result"]["task_id"]
    else:
        raise KeyError("Task ID missing in API response")

async def poll_task(task_id: str, timeout=240, interval=10, max_trials=24):
    url = f"{BASE_URL}/task/{task_id}"
    start = time.time()
    trials = 0

    timeout_config = httpx.Timeout(connect=5.0, read=30.0, write=30.0, pool=5.0)
    
    async with httpx.AsyncClient(timeout=timeout_config) as client:
        while True:
            if trials >= max_trials:
                raise TimeoutError(f"Maximum polling trials reached for task {task_id}")

            if time.time() - start > timeout:
                raise TimeoutError(f"Task polling timed out for task {task_id}")

            try:
                response = await client.get(url, headers=HEADERS)
                response.raise_for_status()
                data = response.json()

                status = data.get("result", {}).get("status")

                if status == "completed":
                    return data["result"]

                if status == "failed":
                    raise RuntimeError(f"Task {task_id} failed")

                # ✅ FIXED: active_requests is now defined before use
                async with active_requests_lock:
                    if task_id in active_requests:
                        progress = min(95, 10 + (trials * 3))
                        active_requests[task_id]["progress"] = progress
                        active_requests[task_id]["status"] = status

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
                raise

            trials += 1
            await asyncio.sleep(interval)

# Database functions - ✅ FIXED: Using context managers
async def check_user_credits(user_id: str) -> int:
    async with db_pool.acquire() as conn:
        try:
            result = await conn.fetchrow(
                "SELECT balance FROM wallets WHERE user_id = $1",
                safe_uuid(user_id)
            )
            return result["balance"] if result else 0
        except Exception:
            raise HTTPException(status_code=500, detail="Database error")

async def refund_credits(user_id: str, amount: int = 1, reason: str = "refund"):
    async with db_pool.acquire() as conn:
        try:
            async with conn.transaction():
                await conn.fetchval(
                    "UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE user_id = $3 RETURNING balance",
                    amount,
                    datetime.utcnow(),
                    safe_uuid(user_id)
                )
                
                await conn.execute(
                    "INSERT INTO credit_ledger (id, user_id, type, amount, reference_id, created_at) VALUES ($1, $2, 'REFUND', $3, $4, $5)",
                    uuid.uuid4(),
                    safe_uuid(user_id),
                    amount,
                    reason,
                    datetime.utcnow()
                )
        except Exception as e:
            logger.error(f"Failed to refund credits: {str(e)}")

async def generate(base64_image: str, task_id: str, user_id: str, settings: GenerationSettings):
    credits_deducted = False
    api_task_id = None
    
    try:
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                wallet = await conn.fetchrow(
                    "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE",
                    safe_uuid(user_id)
                )
                
                if not wallet or wallet["balance"] < 1:
                    raise HTTPException(
                        status_code=402,
                        detail={
                            "error": "Insufficient Credits",
                            "message": "Please purchase more credits.",
                            "current_credits": wallet["balance"] if wallet else 0
                        }
                    )
                
                await conn.execute(
                    "UPDATE wallets SET balance = balance - 1, updated_at = $1 WHERE user_id = $2",
                    datetime.utcnow(),
                    safe_uuid(user_id)
                )
                
                await conn.execute(
                    "INSERT INTO credit_ledger (id, user_id, type, amount, reference_id, created_at) VALUES ($1, $2, 'DEDUCT', -1, $3, $4)",
                    uuid.uuid4(),
                    safe_uuid(user_id),
                    task_id,
                    datetime.utcnow()
                )
                
                credits_deducted = True

        logger.debug(f"Creating task with settings: {settings.dict()}")
        api_task_id = await create_task(base64_image, settings.dict())
        logger.debug(f"Created API task ID: {api_task_id}")
        
        async with active_requests_lock:
            active_requests[task_id]["api_task_id"] = api_task_id
            active_requests[task_id]["status"] = "processing"

        logger.debug(f"Starting to poll task: {api_task_id}")
        result = await poll_task(api_task_id)
        logger.debug(f"Poll task completed with result: {result}")
        
        async with active_requests_lock:
            active_requests[task_id]["status"] = "completed"
            active_requests[task_id]["result"] = result
            active_requests[task_id]["progress"] = 100
        
        return result

    except HTTPException:
        logger.error(f"HTTPException in generate for task {task_id}")
        raise
    except Exception as e:
        logger.error(f"Exception in generate for task {task_id}: {str(e)}", exc_info=True)
        
        if credits_deducted and not api_task_id:
            await refund_credits(user_id, amount=1, reason=f"failed_{task_id}")
        
        async with active_requests_lock:
            if task_id in active_requests:
                active_requests[task_id]["status"] = "failed"
        
        raise

# Endpoints
@app.get("/")
async def root():
    async with active_requests_lock:
        active_count = len(active_requests)
    
    return {
        "status": "Generation API running",
        "message": "Backend is operational",
        "active_requests": active_count,
        "max_concurrent": MAX_CONCURRENT_REQUESTS
    }

@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
    }
    
    async with active_requests_lock:
        health_status["active_requests"] = len(active_requests)
    
    # ✅ FIXED: Using context manager
    async with db_pool.acquire() as conn:
        try:
            await conn.fetchval("SELECT 1")
            health_status["database"] = "connected"
        except Exception:
            health_status["database"] = "disconnected"
            health_status["status"] = "unhealthy"
            raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@app.get("/stats")
async def get_stats():
    async with active_requests_lock:
        tasks_snapshot = {
            task_id: {
                "status": info.get("status"),
                "progress": info.get("progress", 0),
                "started_at": info.get("started_at")
            }
            for task_id, info in active_requests.items()
        }
    
    return {
        "active_requests": len(tasks_snapshot),
        "max_concurrent": MAX_CONCURRENT_REQUESTS,
        "tasks": tasks_snapshot
    }

@app.get("/credits")
@limiter.limit("60/minute")
async def get_credits(request: Request, user_id: str = Depends(get_current_user)):
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
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve credits")

@app.post("/generate-image/")
@limiter.limit("10/minute")
async def generate_image(
    request: Request,
    payload: GenerateImagePayload,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):  
    base64_image = payload.request.base64_image
    settings = payload.settings
    
    if len(base64_image) > MAX_BASE64_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 5MB.")
    
    async with active_requests_lock:
        if len(active_requests) >= MAX_CONCURRENT_REQUESTS * 2:
            raise HTTPException(
                status_code=503, 
                detail="Server is at capacity. Please try again later."
            )
        
        task_id = f"task_{uuid.uuid4().hex[:16]}_{int(time.time() * 1000)}"
        
        active_requests[task_id] = {
            "user_id": user_id,
            "status": "initializing",
            "progress": 0,
            "started_at": datetime.now().isoformat()
        }
    
    try:
        try:
            image_data = base64.b64decode(base64_image)
            validate_image(image_data)
        except ValueError as e:
            async with active_requests_lock:
                del active_requests[task_id]
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

        async with request_semaphore:
            result = await generate(base64_image, task_id, user_id, settings)

        logger.debug(f"Generation result: {result}")

        response = {
            "success": True,
            "status_code": 200,
            "status_text": "OK",
            "message": "Task data retrieved successfully.",
            "result": {
                "task_id": result.get("task_id", ""),
                "status": result.get("status", "completed"),
                "url": result.get("url", ""),
                "elapsed_time": result.get("elapsed_time", 0),
                "expiration_date": result.get("expiration_date", "")
            },
            "credits_remaining": await check_user_credits(user_id)
        }

        background_tasks.add_task(cleanup_task, task_id, delay=300)
        
        return response

    except HTTPException:
        async with active_requests_lock:
            if task_id in active_requests:
                del active_requests[task_id]
        raise
    except Exception as e:
        logger.error(f"Error in generate_image: {str(e)}", exc_info=True)
        async with active_requests_lock:
            if task_id in active_requests:
                del active_requests[task_id]
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")

async def cleanup_task(task_id: str, delay: int = 300):
    await asyncio.sleep(delay)
    async with active_requests_lock:
        if task_id in active_requests:
            del active_requests[task_id]

# ================= RUN ================= #
# uvicorn main:app --host 0.0.0.0 --port 8003 --reload
# For production: uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4

# # ================= RUN ================= #
# # uvicorn main:app --host 0.0.0.0 --port 8003 --reload
# # For production: uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4