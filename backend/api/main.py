#!/usr/bin/env python3
# backend/api/main.py
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --------------------------------------------------------------------- #
# Import the APIRouter defined in routes.py                             #
# --------------------------------------------------------------------- #
from .routes import router as odds_router

# --------------------------------------------------------------------- #
# FastAPI app                                                           #
# --------------------------------------------------------------------- #
app = FastAPI(
    title="NBA-Odds API",
    version="0.1.0",
    description="Backend service serving model-priced NBA money-line odds",
)

# dev-only: allow all origins so the React front-end can call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# mount the /api routes
app.include_router(odds_router)

# simple heartbeat
@app.get("/", include_in_schema=False)
def root():
    return {"msg": "NBA odds service • see /docs for Swagger UI"}
