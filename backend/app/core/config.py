import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    DB_ECHO = os.getenv("DB_ECHO", "false").lower() == "true"

settings = Settings()
