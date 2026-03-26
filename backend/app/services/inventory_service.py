from sqlmodel import Session, select
from app.models.inventory import Inventory


def get_inventory(session: Session, product_id: int, warehouse_id: int):
    return session.exec(
        select(Inventory).where(
            Inventory.product_id == product_id,
            Inventory.warehouse_id == warehouse_id
        )
    ).first()


def increase_stock(session: Session, product_id: int, warehouse_id: int, quantity: int):
    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        inventory = Inventory(
            product_id=product_id,
            warehouse_id=warehouse_id,
            quantity=quantity
        )
        session.add(inventory)
    else:
        inventory.quantity += quantity

    session.commit()
    session.refresh(inventory)
    return inventory
def decrease_stock(session: Session, product_id: int, warehouse_id: int, quantity: int):
    inventory = get_inventory(session, product_id, warehouse_id)
    if not inventory:
        raise Exception("Inventory not found")

    if inventory.quantity < quantity:
        raise Exception("Not enough stock")

    inventory.quantity -= quantity

    session.commit()
    session.refresh(inventory)

    return inventory