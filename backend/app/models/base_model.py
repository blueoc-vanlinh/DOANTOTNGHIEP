from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

class BaseModel(SQLModel):
    id: int | None = Field(default=None, primary_key=True)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )