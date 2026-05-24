import hmac
import hashlib
import json
import os
import time
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from fastapi import HTTPException
from dotenv import load_dotenv
from sqlmodel import Session, select

from app.models.invoice import Invoice

load_dotenv()


MOMO_ENDPOINT = os.getenv(
    "MOMO_ENDPOINT",
    "https://test-payment.momo.vn/v2/gateway/api/create",
)
MOMO_PARTNER_CODE = os.getenv("MOMO_PARTNER_CODE", "")
MOMO_ACCESS_KEY = os.getenv("MOMO_ACCESS_KEY", "")
MOMO_SECRET_KEY = os.getenv("MOMO_SECRET_KEY", "")
MOMO_REDIRECT_URL = os.getenv("MOMO_REDIRECT_URL", "http://localhost:5173/invoices")
MOMO_IPN_URL = os.getenv("MOMO_IPN_URL", "http://localhost:8000/api/v1/momo/ipn")


def create_momo_payment(invoice):
    if not MOMO_PARTNER_CODE or not MOMO_ACCESS_KEY or not MOMO_SECRET_KEY:
        raise HTTPException(
            status_code=400,
            detail=(
                "Missing MoMo sandbox config. Set MOMO_PARTNER_CODE, "
                "MOMO_ACCESS_KEY and MOMO_SECRET_KEY in backend .env"
            ),
        )

    grand_total = _get(invoice, "grand_total") or 0
    total_amount = _get(invoice, "total_amount") or 0
    invoice_number = _get(invoice, "invoice_number")
    invoice_id = _get(invoice, "id")
    amount = int(round(grand_total or total_amount))
    if amount < 1000:
        amount = 1000
    if amount > 50000000:
        raise HTTPException(status_code=400, detail="MoMo amount exceeds sandbox limit")

    payment_token = int(time.time() * 1000)
    request_id = f"{invoice_number}-{payment_token}"
    order_id = request_id
    order_info = f"Thanh toan hoa don {invoice_number}"
    request_type = "payWithMethod"
    extra_data = str(invoice_id)

    raw_signature = (
        f"accessKey={MOMO_ACCESS_KEY}"
        f"&amount={amount}"
        f"&extraData={extra_data}"
        f"&ipnUrl={MOMO_IPN_URL}"
        f"&orderId={order_id}"
        f"&orderInfo={order_info}"
        f"&partnerCode={MOMO_PARTNER_CODE}"
        f"&redirectUrl={MOMO_REDIRECT_URL}"
        f"&requestId={request_id}"
        f"&requestType={request_type}"
    )
    signature = hmac.new(
        MOMO_SECRET_KEY.encode("utf-8"),
        raw_signature.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "partnerName": "Inventory System",
        "storeId": "InventoryStore",
        "requestId": request_id,
        "amount": amount,
        "orderId": order_id,
        "orderInfo": order_info,
        "redirectUrl": MOMO_REDIRECT_URL,
        "ipnUrl": MOMO_IPN_URL,
        "lang": "vi",
        "requestType": request_type,
        "autoCapture": True,
        "extraData": extra_data,
        "signature": signature,
    }

    try:
        body = json.dumps(payload).encode("utf-8")
        req = urlrequest.Request(
            MOMO_ENDPOINT,
            data=body,
            headers={"Content-Type": "application/json; charset=UTF-8"},
            method="POST",
        )
        with urlrequest.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        message = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"MoMo rejected request: {message}") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f"Cannot connect to MoMo: {exc.reason}") from exc

    result_code = data.get("resultCode")
    if result_code not in (None, 0):
        message = data.get("message") or "MoMo rejected request"
        raise HTTPException(status_code=502, detail=message)

    return {
        "invoice_id": invoice_id,
        "invoice_number": invoice_number,
        "amount": amount,
        "request_id": request_id,
        "order_id": order_id,
        "pay_url": data.get("payUrl"),
        "deeplink": data.get("deeplink"),
        "qr_code_url": data.get("qrCodeUrl") or data.get("payUrl"),
        "result_code": result_code,
        "message": data.get("message"),
        "raw": data,
    }


def handle_momo_ipn(session: Session, payload: dict):
    order_id = payload.get("orderId")
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing MoMo orderId")

    invoice_id = payload.get("extraData")
    invoice = None
    if invoice_id:
        try:
            invoice = session.get(Invoice, int(invoice_id))
        except (TypeError, ValueError):
            invoice = None

    invoice_number = str(order_id).rsplit("-", 1)[0]
    if not invoice:
        invoice = session.exec(
            select(Invoice).where(
                Invoice.invoice_number == invoice_number,
                Invoice.is_deleted.is_(False),
            )
        ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    result_code = payload.get("resultCode")
    invoice.momo_trans_id = str(payload.get("transId")) if payload.get("transId") else None
    invoice.payment_status = "PAID" if result_code == 0 else "FAILED"
    if result_code == 0:
        invoice.status = "PAID"

    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    return {
        "message": "MoMo IPN processed",
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "payment_status": invoice.payment_status,
    }


def _get(data, key: str):
    if isinstance(data, dict):
        return data.get(key)
    return getattr(data, key)
