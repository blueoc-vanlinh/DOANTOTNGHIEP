import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    DB_ECHO = os.getenv("DB_ECHO", "false").lower() == "true"
    APP_NAME = os.getenv("APP_NAME", "Inventory Intelligence API")
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            ",".join(
                [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5174",
                    "http://localhost:5175",
                    "http://127.0.0.1:5175",
                    "http://192.168.1.50:5173",
                    "http://192.168.1.50:5174",
                    "http://100.81.28.32:5173",
                    "http://100.81.28.32:5174",
                ]
            ),
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
