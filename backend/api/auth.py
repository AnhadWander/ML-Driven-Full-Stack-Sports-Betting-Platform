# backend/api/auth.py
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from jose import jwt
import os, time

router = APIRouter(prefix="/auth", tags=["auth"])

cfg = Config(".env")

# ★ quick sanity-check: print whether the env var is found
print("GOOGLE_CLIENT_ID =", cfg("GOOGLE_CLIENT_ID", default="⛔ NOT FOUND"))

oauth = OAuth(cfg)
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/ping", include_in_schema=False)
async def ping():
    return {"status": "auth router alive"}

# ── login step ───────────────────────────────────────────
@router.get("/google")
async def login_via_google(request: Request):
    redirect_uri = request.url_for("google_callback")
    print("Redirect URI sending to Google:", redirect_uri)
    return await oauth.google.authorize_redirect(request, redirect_uri)

# ── callback step ────────────────────────────────────────
@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user  = token["userinfo"]

    payload = {
        "sub": user["email"],
        "name": user["name"],
        "exp": int(time.time()) + 60*60*24,
    }
    app_jwt = jwt.encode(payload, "CHANGE_ME_SUPERSECRET", algorithm="HS256")
    return RedirectResponse(f"http://localhost:5173/login?token={app_jwt}")
