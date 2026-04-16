from fastapi import FastAPI
from app.api.v1.api import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(api_router, prefix="/api/v1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173",
                   "http://192.168.1.50:5173",
                   "http://192.168.1.50:5174",
                   "http://100.81.28.32:5173",
                   "http://100.81.28.32:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)