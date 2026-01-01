import os
import time
import base64
import asyncio
import httpx
import uuid
import asyncpg
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header, Request
from fastapi import WebSocket, WebSocketDisconnect
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
import certifi
import ssl
ssl_context = ssl.create_default_context(cafile=certifi.where())

# Import the key manager
from api_key_manager import get_key_manager, APIKeyManager

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

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}

    async def connect(self, task_id: str, websocket: WebSocket):
        self.connections[task_id] = websocket

    async def disconnect(self, task_id: str):
        self.connections.pop(task_id, None)

    async def send(self, task_id: str, message: dict):
        ws = self.connections.get(task_id)
        if ws:
            await ws.send_json(message)

ws_manager = ConnectionManager()



# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
ALGORITHM = "HS256"

# Validate required environment variables
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

BASE_URL = "https://unclothy.com/api/v2"

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
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Global state
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
    
    # Initialize key manager
    try:
        key_manager = get_key_manager()
        logger.info(f"Key manager initialized with {key_manager.get_total_credits()} total credits")
    except Exception as e:
        logger.error(f"Failed to initialize key manager: {str(e)}")
        raise

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
    
def get_current_user_ws(token: str) -> str:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "iss"]},
        )
        return payload["sub"]
    except ExpiredSignatureError:
        raise ValueError("Token expired")
    except JWTError:
        raise ValueError("Invalid token")


# API functions
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(httpx.HTTPStatusError),
    reraise=True
)

async def create_task(base64_image: str, settings: dict, api_key: str) -> str:
    """Create task using dynamically allocated API key"""
    url = f"{BASE_URL}/task/create"
    payload = {
        "base64": base64_image,
        "settings": settings
    }
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    timeout = httpx.Timeout(connect=5.0, read=60.0, write=30.0, pool=5.0)
    
    async with httpx.AsyncClient(
        timeout=timeout,
        verify=ssl_context
    ) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
    
    data = response.json()

    if "result" in data and "task_id" in data["result"]:
        return data["result"]["task_id"]
    else:
        raise KeyError("Task ID missing in API response")

# async def poll_task(task_id: str, api_key: str, timeout=340, interval=10, max_trials=34):
#     """Poll task using the allocated API key"""
#     url = f"{BASE_URL}/task/{task_id}"
#     start = time.time()
#     trials = 0

#     headers = {
#         "x-api-key": api_key,
#         "Content-Type": "application/json"
#     }
    
#     timeout_config = httpx.Timeout(connect=5.0, read=30.0, write=30.0, pool=5.0)
    
#     async with httpx.AsyncClient(
#         timeout=timeout_config,
#         verify=ssl_context
#     ) as client:
#         while True:
#             if trials >= max_trials:
#                 raise TimeoutError(f"Maximum polling trials reached for task {task_id}")

#             if time.time() - start > timeout:
#                 raise TimeoutError(f"Task polling timed out for task {task_id}")

#             try:
#                 response = await client.get(url, headers=headers)
#                 response.raise_for_status()
#                 data = response.json()

#                 status = data.get("result", {}).get("status")

#                 if status == "completed":
#                     return data["result"]

#                 if status == "failed":
#                     raise RuntimeError(f"Task {task_id} failed")

#                 async with active_requests_lock:
#                     if task_id in active_requests:
#                         progress = min(95, 10 + (trials * 3))
#                         active_requests[task_id]["progress"] = progress
#                         active_requests[task_id]["status"] = status
                
#                 await ws_manager.send(task_id, {
#                 "type": "progress",
#                 "value": progress,
#                 "status": status
#                 })

#             except httpx.HTTPStatusError as e:
#                 if e.response.status_code == 404:
#                     raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
#                 raise

#             trials += 1
#             await asyncio.sleep(interval)


async def poll_task(task_id: str, api_key: str, timeout=240, interval=10, max_trials=24):
    url = f"{BASE_URL}/task/{task_id}"
    start = time.time()
    trials = 0

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    timeout_config = httpx.Timeout(connect=5.0, read=30.0, write=30.0, pool=5.0)

    async with httpx.AsyncClient(timeout=timeout_config, verify=ssl_context) as client:
        while True:
            # Calculate progress FIRST, before any operations
            progress = min(95, 10 + (trials * 3))
            
            if trials >= max_trials:
                raise TimeoutError(f"Maximum polling trials reached for task {task_id}")

            if time.time() - start > timeout:
                raise TimeoutError(f"Task polling timed out for task {task_id}")

            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()

                result = data.get("result", {})
                status = result.get("status")

                if status == "completed":
                    return result

                if status == "failed":
                    raise RuntimeError(f"Task {task_id} failed")

                # Update internal state safely
                async with active_requests_lock:
                    if task_id in active_requests:
                        active_requests[task_id]["progress"] = progress
                        active_requests[task_id]["status"] = status

                # Send websocket update (safe)
                await ws_manager.send(task_id, {
                    "type": "progress",
                    "value": progress,
                    "status": status
                })

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
                raise

            trials += 1
            await asyncio.sleep(interval)


# Database functions
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
    """
    Main generation function with distributed API key management
    """
    credits_deducted = False
    api_task_id = None
    key_manager = get_key_manager()
    progress = 0

    try:
        # Deduct user credits first
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
                await ws_manager.send(task_id, {
                    "type": "credits",
                    "action": "deducted",
                    "balance": wallet["balance"] - 1
                })


        # Use context manager for automatic key allocation and cleanup
        async with key_manager.allocate_key(task_id) as api_key:
            if not api_key:
                # No API keys available - refund user and raise error
                if credits_deducted:
                    await refund_credits(user_id, amount=1, reason=f"no_api_key_{task_id}")
                
                raise HTTPException(
                    status_code=503,
                    detail={
                        "error": "Service Temporarily Unavailable",
                        "message": "All API keys are currently in use or out of credits. Please try again in a moment.",
                        "total_api_credits": key_manager.get_total_credits()
                    }
                )
            
            logger.debug(f"Creating task with settings: {settings.dict()}")
            api_task_id = await create_task(base64_image, settings.dict(), api_key)
            logger.debug(f"Created API task ID: {api_task_id}")
            
            async with active_requests_lock:
                active_requests[task_id]["api_task_id"] = api_task_id
                active_requests[task_id]["status"] = "processing"

            logger.debug(f"Starting to poll task: {api_task_id}")
            result = await poll_task(api_task_id, api_key)
            logger.debug(f"Poll task completed with result: {result}")
            
            async with active_requests_lock:
                active_requests[task_id]["status"] = "completed"
                active_requests[task_id]["result"] = result
                active_requests[task_id]["progress"] = 100
            
            # Key credit will be deducted automatically by context manager
            return result

    except HTTPException as e:
        logger.error(f"HTTPException in generate for task {task_id}: {e.detail}")

        if credits_deducted and not api_task_id:
            await refund_credits(user_id, amount=1, reason=f"failed_{task_id}")

            await ws_manager.send(task_id, {
                "type": "credits",
                "action": "refunded",
                "balance": await check_user_credits(user_id)
            })

        async with active_requests_lock:
            if task_id in active_requests:
                active_requests[task_id]["status"] = "failed"

        raise

    except Exception as e:
        logger.error(
            f"Exception in generate for task {task_id}: {str(e)}",
            exc_info=True
        )

        if credits_deducted and not api_task_id:
            await refund_credits(user_id, amount=1, reason=f"failed_{task_id}")

            await ws_manager.send(task_id, {
                "type": "credits",
                "action": "refunded",
                "balance": await check_user_credits(user_id)
            })

        async with active_requests_lock:
            if task_id in active_requests:
                active_requests[task_id]["status"] = "failed"

        raise



# Endpoints
@app.get("/")
async def root():
    async with active_requests_lock:
        active_count = len(active_requests)
    
    key_manager = get_key_manager()
    
    return {
        "status": "Generation API running",
        "message": "Backend is operational",
        "active_requests": active_count,
        "max_concurrent": MAX_CONCURRENT_REQUESTS,
        "api_keys_available": len(key_manager.get_available_keys()),
        "total_api_credits": key_manager.get_total_credits()
    }

@app.websocket("/ws/generate")
async def websocket_generate(websocket: WebSocket):
    await websocket.accept()

    try:
        # --- AUTH ---
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=1008)
            return

        user_id = get_current_user_ws(token)

        # --- RECEIVE JOB ---
        data = await websocket.receive_json()
        payload = GenerateImagePayload(**data)

        base64_image = payload.request.base64_image
        settings = payload.settings

        task_id = f"task_{uuid.uuid4().hex[:16]}_{int(time.time() * 1000)}"

        await ws_manager.connect(task_id, websocket)

        async with active_requests_lock:
            active_requests[task_id] = {
                "user_id": user_id,
                "status": "queued",
                "progress": 0,
                "started_at": datetime.utcnow().isoformat(),
            }

        await ws_manager.send(task_id, {
            "type": "queue",
            "position": len(active_requests)
        })

        # --- RUN GENERATION ---
        async with request_semaphore:
            result = await generate(base64_image, task_id, user_id, settings)

        await ws_manager.send(task_id, {
            "type": "completed",
            "result_url": result.get("url"),
            "credits_remaining": await check_user_credits(user_id)
        })

    except HTTPException as e:
        await websocket.send_json({
            "type": "error",
            "message": e.detail
        })
    except WebSocketDisconnect:
        pass
    finally:
        async with active_requests_lock:
            active_requests.pop(task_id, None)
        await ws_manager.disconnect(task_id)


@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
    }
    
    async with active_requests_lock:
        health_status["active_requests"] = len(active_requests)
    
    # Check database
    async with db_pool.acquire() as conn:
        try:
            await conn.fetchval("SELECT 1")
            health_status["database"] = "connected"
        except Exception:
            health_status["database"] = "disconnected"
            health_status["status"] = "unhealthy"
            raise HTTPException(status_code=503, detail=health_status)
    
    # Check API key manager
    try:
        key_manager = get_key_manager()
        health_status["api_keys"] = {
            "total": len(key_manager.keys),
            "available": len(key_manager.get_available_keys()),
            "total_credits": key_manager.get_total_credits()
        }
    except Exception as e:
        health_status["api_keys"] = "error"
        health_status["status"] = "degraded"
        logger.error(f"API key health check failed: {str(e)}")
    
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
    
    key_manager = get_key_manager()
    key_stats = key_manager.get_key_stats()
    
    return {
        "active_requests": len(tasks_snapshot),
        "max_concurrent": MAX_CONCURRENT_REQUESTS,
        "tasks": tasks_snapshot,
        "api_key_pool": key_stats
    }

@app.get("/api-keys/status")
@limiter.limit("30/minute")
async def get_api_key_status(request: Request, user_id: str = Depends(get_current_user)):
    """Get detailed status of API key pool (admin endpoint)"""
    key_manager = get_key_manager()
    return key_manager.get_key_stats()

@app.get("/credits")
@limiter.limit("60/minute")
async def get_credits(request: Request, user_id: str = Depends(get_current_user)):
    try:
        user_credits = await check_user_credits(user_id)
        key_manager = get_key_manager()
        
        return {
            "success": True,
            "status_code": 200,
            "message": "Credits retrieved successfully",
            "user_id": user_id,
            "credits": user_credits,
            "sufficient": user_credits > 0,
            "api_pool": {
                "available_keys": len(key_manager.get_available_keys()),
                "total_credits": key_manager.get_total_credits()
            }
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
    
    # Check if API keys are available
    key_manager = get_key_manager()
    if key_manager.get_total_credits() == 0:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Service Unavailable",
                "message": "All API keys are out of credits. Please contact support."
            }
        )
    
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
            "credits_remaining": await check_user_credits(user_id),
            "api_credits_remaining": key_manager.get_total_credits()
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