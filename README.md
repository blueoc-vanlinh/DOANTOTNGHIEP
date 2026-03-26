alembic revision --autogenerate -m "init full schema"

alembic upgrade head 

alembic revision --autogenerate -m "update ..."

📦 Inventory System Backend
🚀 Tech Stack
FastAPI
PostgreSQL
SQLModel
Alembic
⚙️ Setup
# tạo môi trường
python -m venv venv

# activate (Windows)
venv\Scripts\activate

# cài thư viện
pip install -r requirements.txt
🔑 ENV

.env

DATABASE_URL=postgresql://postgres:Seta2022!@localhost:5433/inventory
🗄️ Migration
# tạo migration
alembic revision --autogenerate -m "init"

# chạy DB
alembic upgrade head
▶️ Run Server
cd backend
uvicorn app.main:app --reload

👉 Swagger:
http://127.0.0.1:8000/docs