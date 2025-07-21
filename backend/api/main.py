from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .auth import router as auth_router          
from .routes import router as odds_router

app = FastAPI(title="NBA-Odds API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="CHANGE_ME_SESSION")   

app.include_router(odds_router)
app.include_router(auth_router)      


@app.get("/", include_in_schema=False)
def root():
    return {"msg": "NBA odds – see /docs"}
