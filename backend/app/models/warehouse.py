from app.db.base_model import BaseModel

class Warehouse(BaseModel, table=True):
    __tablename__ = "warehouses"

    name: str
    location: str | None = None