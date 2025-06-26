# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as odds_router

app = FastAPI(title="NBA-Odds API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(odds_router)


@app.get("/", include_in_schema=False)
def root():
    return {"msg": "NBA odds – see /docs"}
