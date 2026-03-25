from app.db.base_model import BaseModel

class Supplier(BaseModel, table=True):
    __tablename__ = "suppliers"

    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None