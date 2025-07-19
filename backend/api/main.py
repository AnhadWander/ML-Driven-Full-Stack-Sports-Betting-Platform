# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .auth import router as auth_router          # ← new router
from .routes import router as odds_router

app = FastAPI(title="NBA-Odds API")

# ───────── middleware ─────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # dev only – tighten in prod
    allow_methods=["GET"],
    allow_headers=["*"],
)

# session cookies required by Authlib’s OAuth flow
app.add_middleware(SessionMiddleware, secret_key="CHANGE_ME_SESSION")   # ← NEW

# ───────── routers ─────────
app.include_router(odds_router)
app.include_router(auth_router)       # ← NEW


@app.get("/", include_in_schema=False)
def root():
    return {"msg": "NBA odds – see /docs"}
