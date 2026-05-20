# Inventory System

He thong quan ly kho gom FastAPI backend, PostgreSQL, Alembic va React frontend. Du an da co cac luong chinh: nhap kho, xuat kho, ton kho, hoa don, AI du bao, du lieu AI, phan quyen role/permission va tu dong hoa kho.

## Tech Stack

- Backend: FastAPI, SQLModel, SQLAlchemy, Alembic, PostgreSQL.
- Frontend: React, TypeScript, Vite, Ant Design, React Query, Zustand.
- AI: Prophet baseline, neural time-series tu train bang du lieu giao dich, optional PyTorch LSTM neu cai `torch`.
- Test/CI: pytest backend, ESLint/type-check/build frontend, GitHub Actions.

## Cau Hinh Moi Truong

Tao file `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:Seta2022!@localhost:5433/inventory
SECRET_KEY=change-me
DB_ECHO=false

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=http://localhost:5173/invoices
MOMO_IPN_URL=http://localhost:8000/api/v1/momo/ipn
```

MoMo key co the de trong khi chua duoc cap. Khi tao QR thanh toan, backend se bao loi cau hinh MoMo neu thieu key.

## Chay Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

Swagger: `http://127.0.0.1:8000/docs`

Neu database da co bang cu, migration init da duoc lam idempotent de tranh loi `relation "categories" already exists`. Chay lai `alembic upgrade head` la duoc.

## Chay Frontend

```bash
cd frontend
npm ci
npm run dev
```

Mac dinh frontend chay tai `http://127.0.0.1:5173`.

## Tai Khoan Seed

Seed tao du lieu mau cho san pham, kho, giao dich AI, yeu to ngoai vi, hoa don va role/quyen. Tat ca tai khoan mau co mat khau `Admin@123`.

| Role | Email |
| --- | --- |
| Admin | `admin@inventory.com` |
| Manager | `manager@inventory.com` |
| Staff | `staff1@inventory.com` |
| Auditor | `auditor@inventory.com` |
| Buyer | `buyer@inventory.com` |
| Seller | `seller@inventory.com` |
| Logistic | `logistic@inventory.com` |
| Quality | `quality@inventory.com` |
| Support | `support@inventory.com` |
| Finance | `finance@inventory.com` |

Tai khoan Admin duoc gan day du quyen, cac role thap hon chi thay cac trang phu hop tren frontend va bi chan them o backend.

## Role Va Quyen

- Admin: dung duoc toan bo he thong, gom quan ly nhan vien, role, AI data, warehouse automation va hoa don.
- Manager/Staff: chi duoc truy cap cac chuc nang theo permission duoc gan.
- Backend enforce role/permission bang Bearer token tai cac API quan trong, khong chi an menu tren frontend.
- Frontend an cac trang cap cao voi nhan vien khong co role Admin.

## API Chinh Moi

- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`
- Roles: `GET/POST /api/v1/roles`, `PUT/DELETE /api/v1/roles/{id}`
- Users: `GET/POST/PUT/DELETE /api/v1/users`
- AI data: `GET /api/v1/ai-data/overview`, `GET /api/v1/ai-data/products/{product_id}/quality`, `GET /api/v1/ai-data/products/{product_id}/deep-learning-dataset`, `POST /api/v1/ai-data/external-factors`
- Forecast: tra ve du lieu lich su that, Prophet baseline, neural time-series va optional LSTM.
- Warehouse automation: `GET /api/v1/warehouse-automation/auto-po`, `GET /api/v1/warehouse-automation/slotting`, `GET /api/v1/warehouse-automation/barcode/{barcode}`
- Invoices: `GET /api/v1/invoices`, `POST /api/v1/invoices/from-order/{IMPORT|EXPORT}/{order_id_or_code}`, `POST /api/v1/invoices/{invoice_id}/momo-payment`
- MoMo IPN: `POST /api/v1/momo/ipn`

## Bao Mat

- Login co rate-limit theo email.
- Backend tra access token va refresh token, dong thoi set vao httpOnly cookie `access_token` va `refresh_token` cho frontend.
- Frontend khong luu access/refresh token trong `localStorage`; `localStorage` chi giu thong tin user de hien thi UI.
- Backend van chap nhan Bearer token de dung Swagger/Postman khi can test thu cong.

## Luong Xuat Kho - Hoa Don - MoMo

1. Tao phieu xuat kho tren frontend.
2. Backend tu sinh `order_code` theo gio ngay thang nam, bat dau bang `0` de khac ma hoa don.
3. Backend lay gia tu san pham neu dong xuat kho khong truyen gia, tinh tam tinh, VAT va tong tien.
4. Backend tu tao hoa don tu phieu xuat va sinh ma hoa don theo dinh dang `HHmmddMMyyyy`.
5. Trang hoa don co search theo ma hoa don/khach hang/trang thai.
6. Nut chi tiet hoa don co the tao QR MoMo sandbox khi da cau hinh key, sau do in hoa don kem QR.

## AI Forecast

Trang du lieu AI dung de kiem tra chat luong dataset truoc khi train:

- Tong so ban ghi giao dich co the hoc.
- So ngay co du lieu that theo tung san pham.
- Du lieu yeu to ngoai vi nhu gia thi truong, su kien, muc bien dong.
- Dataset daily time-series cho LSTM/Transformer.

Trang du bao hien dung du lieu giao dich that tu database, khong con mock data. Prophet la baseline. Neural time-series tu train bang NumPy duoc dung khi du du lieu. Neu cai them PyTorch va co du lieu >= 180 ngay, module LSTM se duoc uu tien.

## Test Tu Dong

Backend da co test cho cac luong chinh:

- Dang nhap va refresh token.
- Xuat kho tu tao ma phieu, tinh tien, VAT va hoa don.
- Search hoa don.
- Admin role co day du permission.
- Forecast AI tra ve du lieu lich su va ket qua model.

Chay test:

```bash
cd backend
pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run type-check
npm run build
```

## CI/CD

Workflow GitHub Actions hien se fail neu:

- Backend lint co loi nghiem trong.
- Backend pytest fail.
- Frontend lint/type-check/build fail.

## Load Testing

```bash
cd backend
pip install locust
locust -f tests/load/locustfile.py --host http://127.0.0.1:8000
```
