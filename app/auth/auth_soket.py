from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Header,
    Request,
)
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field, field_validator
from passlib.context import CryptContext # type: ignore
from jose import jwt, JWTError, ExpiredSignatureError # type: ignore
from datetime import datetime, timedelta
from typing import Optional
import os
import uuid
import re
import asyncpg

from dotenv import load_dotenv
from slowapi import Limiter # type: ignore
from slowapi.util import get_remote_address # type: ignore
from slowapi.errors import RateLimitExceeded # type: ignore

# NEW: Google OAuth
from google.oauth2 import id_token # type: ignore
from google.auth.transport import requests as google_requests # type: ignore 

# ================= ENV ================= #
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # NEW: Add to .env

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

if not GOOGLE_CLIENT_ID:
    raise RuntimeError("GOOGLE_CLIENT_ID not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
app = FastAPI(title="Auth Service", version="1.0.0")


# ================= DB ================= #
db_pool = None

@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL, ssl="require")

@app.on_event("shutdown")
async def shutdown():
    await db_pool.close()

async def get_db():
    async with db_pool.acquire() as conn:
        yield conn

# ================= RATE LIMITER ================= #
limiter = Limiter(key_func=get_remote_address)

# ================= APP ================= #
app.state.limiter = limiter
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Try again later."},
    )

# ================= SECURITY ================= #
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": int(datetime.utcnow().timestamp()),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iss": "auth-service",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    authorization: Optional[str] = Header(None),
) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

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
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# NEW: Google token verification
# async def verify_google_token(token: str) -> dict:
#     """Verify Google ID token and return user info"""
#     try:
#         idinfo = id_token.verify_oauth2_token(
#             token, 
#             google_requests.Request(), 
#             GOOGLE_CLIENT_ID
#         )
        
#         # Verify token is for our app
#         if idinfo['aud'] != GOOGLE_CLIENT_ID:
#             raise ValueError('Invalid audience')
            
#         # Return user info
#         return {
#             'email': idinfo['email'],
#             'email_verified': idinfo.get('email_verified', False),
#             'name': idinfo.get('name', ''),
#             'picture': idinfo.get('picture', ''),
#             'google_id': idinfo['sub']
#         }
#     except ValueError as e:
#         raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

# Replace the verify_google_token function with this:
async def verify_google_token(access_token: str) -> dict:
    """Verify Google access token and return user info"""
    try:
        # Use access token to get user info from Google's userinfo endpoint
        import httpx
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code != 200:
                raise ValueError('Invalid token')
                
            user_info = response.json()
            
            return {
                'email': user_info['email'],
                'email_verified': user_info.get('email_verified', False),
                'name': user_info.get('name', ''),
                'picture': user_info.get('picture', ''),
                'google_id': user_info['sub']
            }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

# Update GoogleAuthRequest to accept access_token instead:
class GoogleAuthRequest(BaseModel):
    id_token: str  # This will now receive an access token from frontend

def verify_ws_token(token: str) -> str:
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
    
async def websocket_auth(websocket: WebSocket) -> str:
    token = None

    auth_header = websocket.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

    if not token:
        token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        raise RuntimeError("Missing token")

    try:
        return verify_ws_token(token)
    except ValueError:
        await websocket.close(code=1008)
        raise

# ================= SCHEMAS ================= #
class SignupRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$"
        if not re.match(pattern, v):
            raise ValueError("Password too weak")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> EmailStr:
        return v.lower()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# NEW: Google Auth Schema
class GoogleAuthRequest(BaseModel):
    id_token: str  # Firebase ID token from frontend

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if v != info.data.get("new_password"):
            raise ValueError("Passwords do not match")
        return v

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None  # NEW: Include user info

# ================= ROUTES ================= #

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        user_id = await websocket_auth(websocket)
        
        async with db_pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id FROM users WHERE id = $1",
                uuid.UUID(user_id),
            )
            if not user:
                await websocket.close(code=1008)
                return
        
        await websocket.send_json({
            "message": "Connected",
            "user_id": user_id
        })
        
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "echo": data,
                "user_id": user_id
            })
    except WebSocketDisconnect:
        print(f"WebSocket disconnected")

@app.post("/signup", response_model=AuthResponse)
@limiter.limit("3/10minutes")
async def signup(request: Request, data: SignupRequest, conn = Depends(get_db)):
    async with conn.transaction():
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1",
            data.email,
        )
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_id = uuid.uuid4()
        now = datetime.utcnow()

        await conn.execute(
            """
            INSERT INTO users (id, email, password_hash, created_at, auth_provider)
            VALUES ($1, $2, $3, $4, 'email')
            """,
            user_id,
            data.email,
            hash_password(data.password),
            now,
        )

        await conn.execute(
            """
            INSERT INTO wallets (user_id, balance, updated_at)
            VALUES ($1, 1, $2)
            """,
            user_id,
            now,
        )

        await conn.execute(
            """
            INSERT INTO credit_ledger
            (id, user_id, type, amount, reference_id, created_at)
            VALUES ($1, $2, 'FREE', 1, 'signup', $3)
            """,
            uuid.uuid4(),
            user_id,
            now,
        )

    return AuthResponse(
        success=True,
        message="Signup successful",
        token=create_access_token(str(user_id)),
        user={"id": str(user_id), "email": data.email}
    )

@app.post("/login", response_model=AuthResponse)
@limiter.limit("5/5minutes")
async def login(data: LoginRequest, request: Request, conn = Depends(get_db)):
    user = await conn.fetchrow(
        "SELECT id, email, password_hash, auth_provider FROM users WHERE email = $1",
        data.email,
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user signed up with Google
    if user["auth_provider"] == "google":
        raise HTTPException(
            status_code=400, 
            detail="This account uses Google Sign-In. Please sign in with Google."
        )

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return AuthResponse(
        success=True,
        message="Welcome back",
        token=create_access_token(str(user["id"])),
        user={"id": str(user["id"]), "email": user["email"]}
    )

# NEW: Google Sign-In/Sign-Up Endpoint
@app.post("/auth/google", response_model=AuthResponse)
@limiter.limit("10/5minutes")
async def google_auth(
    request: Request,
    data: GoogleAuthRequest, 
    conn = Depends(get_db)
):
    """Handle Google Sign-In/Sign-Up"""
    
    # Verify the Google token
    google_user = await verify_google_token(data.id_token)
    
    if not google_user['email_verified']:
        raise HTTPException(status_code=400, detail="Email not verified by Google")
    
    email = google_user['email'].lower()
    google_id = google_user['google_id']
    
    # Check if user exists
    user = await conn.fetchrow(
        "SELECT id, auth_provider, google_id FROM users WHERE email = $1",
        email,
    )
    
    if user:
        # User exists - check auth provider
        if user["auth_provider"] == "email":
            raise HTTPException(
                status_code=400,
                detail="This email is registered with password. Please login with email/password."
            )
        
        # Update google_id if changed (rare case)
        if user["google_id"] != google_id:
            await conn.execute(
                "UPDATE users SET google_id = $1 WHERE id = $2",
                google_id,
                user["id"]
            )
        
        user_id = user["id"]
        message = "Welcome back"
        
    else:
        # New user - create account
        user_id = uuid.uuid4()
        now = datetime.utcnow()
        
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO users 
                (id, email, password_hash, created_at, auth_provider, google_id, display_name, profile_picture)
                VALUES ($1, $2, $3, $4, 'google', $5, $6, $7)
                """,
                user_id,
                email,
                None,  # No password for Google users
                now,
                google_id,
                google_user.get('name', ''),
                google_user.get('picture', '')
            )
            
            # Create wallet with initial credits
            await conn.execute(
                """
                INSERT INTO wallets (user_id, balance, updated_at)
                VALUES ($1, 1, $2)
                """,
                user_id,
                now,
            )
            
            # Add signup credit
            await conn.execute(
                """
                INSERT INTO credit_ledger
                (id, user_id, type, amount, reference_id, created_at)
                VALUES ($1, $2, 'FREE', 1, 'signup_google', $3)
                """,
                uuid.uuid4(),
                user_id,
                now,
            )
        
        message = "Account created successfully"
    
    return AuthResponse(
        success=True,
        message=message,
        token=create_access_token(str(user_id)),
        user={
            "id": str(user_id),
            "email": email,
            "name": google_user.get('name', ''),
            "picture": google_user.get('picture', '')
        }
    )

@app.post("/forgot-password")
@limiter.limit("3/10minutes")
async def forgot_password(data: ForgotPasswordRequest, request: Request, conn = Depends(get_db)):
    user = await conn.fetchrow(
        "SELECT password_hash, auth_provider FROM users WHERE email = $1",
        data.email,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["auth_provider"] == "google":
        raise HTTPException(
            status_code=400,
            detail="This account uses Google Sign-In. Password reset not available."
        )

    if verify_password(data.new_password, user["password_hash"]):
        raise HTTPException(
            status_code=400,
            detail="New password must be different",
        )

    await conn.execute(
        """
        UPDATE users
        SET password_hash = $1
        WHERE email = $2
        """,
        hash_password(data.new_password),
        data.email,
    )

    return {"success": True, "message": "Password updated"}

@app.get("/me")
async def me(user_id: str = Depends(get_current_user), conn = Depends(get_db)):
    user = await conn.fetchrow(
        """
        SELECT u.id, u.email, u.display_name, u.profile_picture, u.auth_provider, w.balance
        FROM users u
        LEFT JOIN wallets w ON u.id = w.user_id
        WHERE u.id = $1
        """,
        uuid.UUID(user_id),
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["id"]),
        "email": user["email"],
        "name": user["display_name"],
        "picture": user["profile_picture"],
        "auth_provider": user["auth_provider"],
        "credits": user["balance"] or 0,
    }

@app.get("/")
async def root():
    return {"message": "Auth API running 🚀"}