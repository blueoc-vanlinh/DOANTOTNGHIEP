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
python -m py_compile seed.py
👉 Swagger:
http://127.0.0.1:8000/docs

rc/
├── features/
│   ├── products/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── pages/
│   │   └── components/
│   ├── inventory/
│   ├── import/
│   ├── export/
│   ├── dashboard/
│
├── components/
│   ├── common/
│   ├── layout/
│   └── notification/
│
├── lib/
│   ├── api.ts
│   ├── react-query.ts
│
├── routes/
├── theme/
├── utils/
├── constants/

$ docker exec -it dev_backend bash
$ docker exec -it uat_backend bash

docker exec -it inventory_db psql -U postgres

## AI/data upgrades

- Xem tổng số bản ghi dùng cho huấn luyện AI: `GET /api/v1/ai-data/overview`
- Kiểm tra chất lượng dữ liệu theo sản phẩm: `GET /api/v1/ai-data/products/{product_id}/quality`
- Xuất dataset dạng daily time series cho LSTM/Transformer: `GET /api/v1/ai-data/products/{product_id}/deep-learning-dataset`
- Bổ sung yếu tố ngoại vi như giá, sự kiện, biến động thị trường: `POST /api/v1/ai-data/external-factors`

Prophet hiện vẫn là baseline. Chỉ nên train LSTM/Transformer khi mỗi sản phẩm có ít nhất khoảng 180 ngày dữ liệu xuất kho thật.

## Warehouse automation

- Gợi ý tự động lập đơn mua hàng: `GET /api/v1/warehouse-automation/auto-po`
- Gợi ý sắp xếp vị trí hàng theo tốc độ xuất kho: `GET /api/v1/warehouse-automation/slotting`
- Tra cứu sản phẩm bằng barcode/QR payload: `GET /api/v1/warehouse-automation/barcode/{barcode}`

## Invoices

- Tạo hóa đơn thủ công: `POST /api/v1/invoices/`
- Tạo hóa đơn từ phiếu nhập/xuất: `POST /api/v1/invoices/from-order/{IMPORT|EXPORT}/{order_id}`
- Danh sách hóa đơn: `GET /api/v1/invoices/`

## Load testing

```bash
pip install locust
locust -f tests/load/locustfile.py --host http://127.0.0.1:8000
```
