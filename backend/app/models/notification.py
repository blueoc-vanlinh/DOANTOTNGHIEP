from sqlmodel import Boolean, Column, Field
from app.db.base_model import BaseModel

class Notification(BaseModel, table=True):
    __tablename__ = "notifications"

    user_id: int = Field(foreign_key="users.id")
    title: str
    message: str

    is_read: bool = False
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    
