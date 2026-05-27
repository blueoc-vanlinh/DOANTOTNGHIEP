from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.services.activity_middleware import activity_middleware

app = FastAPI(title=settings.APP_NAME)
app.include_router(api_router, prefix="/api/v1")
app.middleware("http")(activity_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
