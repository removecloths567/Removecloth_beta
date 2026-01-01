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

# ================= ENV ================= #
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ================= DB ================= #
async def get_db():
        return await asyncpg.connect(DATABASE_URL, ssl="require")

# ================= RATE LIMITER ================= #
limiter = Limiter(key_func=get_remote_address)

# ================= APP ================= #
app = FastAPI(title="Auth Service", version="1.0.0")
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

# ================= ROUTES ================= #

@app.post("/signup", response_model=AuthResponse)
@limiter.limit("3/10minutes")
async def signup(request: Request, data: SignupRequest):
    conn = await get_db()
    try:
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
                INSERT INTO users (id, email, password_hash, created_at)
                VALUES ($1, $2, $3, $4)
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
        )
    finally:
        await conn.close()

@app.post("/login", response_model=AuthResponse)
@limiter.limit("5/5minutes")
async def login(data: LoginRequest, request: Request):
    conn = await get_db()
    try:
        user = await conn.fetchrow(
            "SELECT id, password_hash FROM users WHERE email = $1",
            data.email,
        )

        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return AuthResponse(
            success=True,
            message="Welcome back",
            token=create_access_token(str(user["id"])),
        )
    finally:
        await conn.close()

@app.post("/forgot-password")
@limiter.limit("3/10minutes")
async def forgot_password(data: ForgotPasswordRequest, request: Request):
    conn = await get_db()
    try:
        user = await conn.fetchrow(
            "SELECT password_hash FROM users WHERE email = $1",
            data.email,
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

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
    finally:
        await conn.close()

@app.get("/me")
async def me(user_id: str = Depends(get_current_user)):
    conn = await get_db()
    try:
        user = await conn.fetchrow(
            """
            SELECT u.id, u.email, w.balance
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
            "credits": user["balance"] or 0,
        }
    finally:
        await conn.close()

@app.get("/")
async def root():
    return {"message": "Auth API running 🚀"}
