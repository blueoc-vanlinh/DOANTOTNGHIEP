from app.models.invoice import Invoice
from app.services.invoice_service import list_invoices


def test_invoice_search_by_invoice_number(session):
    session.add(
        Invoice(
            invoice_number="123020052026",
            invoice_type="EXPORT",
            order_id=1,
            partner_name="Khách A",
            total_amount=100000,
            tax_amount=8000,
            discount_amount=0,
            grand_total=108000,
            status="ISSUED",
        )
    )
    session.commit()

    result = list_invoices(session, search="123020052026")

    assert len(result) == 1
    assert result[0].invoice_number == "123020052026"
