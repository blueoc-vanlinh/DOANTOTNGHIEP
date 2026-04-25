from typing import List, Dict, Any, Optional
from sqlmodel import Session, select, func, and_, or_

from app.models.inventory import Inventory
from app.models.product import Product
from app.models.warehouse import Warehouse


def get_inventories(
    session: Session,
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
) -> Dict[str, Any]:
    query = (
        select(
            Inventory,
            Product.name.label("product_name"),
            Warehouse.name.label("warehouse_name")
        )
        .join(Product, Product.id == Inventory.product_id)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(Inventory.is_deleted.is_(False))
    )

    # Filter
    if product_id is not None:
        query = query.where(Inventory.product_id == product_id)

    if warehouse_id is not None:
        query = query.where(Inventory.warehouse_id == warehouse_id)

    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Warehouse.name.ilike(f"%{search}%"),
            )
        )
    count_subq = (
        select(Inventory.id)
        .join(Product, Product.id == Inventory.product_id)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(Inventory.is_deleted.is_(False))
    )

    if product_id:
        count_subq = count_subq.where(Inventory.product_id == product_id)

    if warehouse_id:
        count_subq = count_subq.where(Inventory.warehouse_id == warehouse_id)

    if search:
        count_subq = count_subq.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Warehouse.name.ilike(f"%{search}%"),
            )
        )

    count_subq = count_subq.subquery()

    count_query = select(func.count()).select_from(count_subq)

    if product_id is not None:
        count_query = count_query.where(Inventory.product_id == product_id)
    if warehouse_id is not None:
        count_query = count_query.where(Inventory.warehouse_id == warehouse_id)
    if search:
        count_query = count_query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Warehouse.name.ilike(f"%{search}%"),
            )
        )

    total = session.exec(count_query).one() or 0
    query = query.offset(skip).limit(limit)
    results = session.exec(query).all()
    items: List[Dict[str, Any]] = []
    for inv, product_name, warehouse_name in results:
        items.append({
            "id": inv.id,
            "product_id": inv.product_id,
            "product_name": product_name,
            "warehouse_id": inv.warehouse_id,
            "warehouse_name": warehouse_name,
            "quantity": inv.quantity,
            "reserved_quantity": inv.reserved_quantity,
            "oncoming_quantity": inv.oncoming_quantity,
            "min_threshold": inv.min_threshold,
            "is_deleted": inv.is_deleted,
            "created_at": inv.created_at,
            "updated_at": inv.updated_at,
        })

    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
    }


def get_inventory_with_details(
    session: Session, 
    product_id: int, 
    warehouse_id: int
) -> Optional[Dict[str, Any]]:
    result = session.exec(
        select(
            Inventory,
            Product.name.label("product_name"),
            Warehouse.name.label("warehouse_name")
        )
        .join(Product, Product.id == Inventory.product_id)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(
            and_(
                Inventory.product_id == product_id,
                Inventory.warehouse_id == warehouse_id,
                Inventory.is_deleted.is_(False)
            )
        )
    ).first()

    if not result:
        return None

    inventory, product_name, warehouse_name = result

    return {
        "id": inventory.id,
        "product_id": inventory.product_id,
        "product_name": product_name,
        "warehouse_id": inventory.warehouse_id,
        "warehouse_name": warehouse_name,
        "quantity": inventory.quantity,
        "reserved_quantity": inventory.reserved_quantity,
        "oncoming_quantity": inventory.oncoming_quantity,
        "min_threshold": inventory.min_threshold,
        "is_deleted": inventory.is_deleted,
        "created_at": inventory.created_at,
        "updated_at": inventory.updated_at,
    }


def increase_stock(
    session: Session, 
    product_id: int, 
    warehouse_id: int, 
    quantity: int
) -> Inventory:
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        inventory = Inventory(
            product_id=product_id,
            warehouse_id=warehouse_id,
            quantity=quantity,
            reserved_quantity=0,
            oncoming_quantity=0,
            min_threshold=10
        )
        session.add(inventory)
    else:
        inventory.quantity += quantity

    session.commit()
    session.refresh(inventory)
    return inventory


def decrease_stock(
    session: Session, 
    product_id: int, 
    warehouse_id: int, 
    quantity: int
) -> Inventory:
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        raise ValueError(f"Inventory not found for product_id={product_id}, warehouse_id={warehouse_id}")

    if inventory.quantity < quantity:
        raise ValueError(f"Not enough stock. Available: {inventory.quantity}, Requested: {quantity}")

    inventory.quantity -= quantity

    session.commit()
    session.refresh(inventory)
    return inventory
def adjust_stock(
    session: Session, 
    product_id: int, 
    warehouse_id: int, 
    quantity: int
) -> Inventory:
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")

    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        inventory = Inventory(
            product_id=product_id,
            warehouse_id=warehouse_id,
            quantity=quantity,
            reserved_quantity=0,
            oncoming_quantity=0,
            min_threshold=10
        )
        session.add(inventory)
    else:
        inventory.quantity = quantity

    session.commit()
    session.refresh(inventory)
    return inventory

def get_inventory(session: Session, product_id: int, warehouse_id: int) -> Optional[Inventory]:
    """Lấy inventory cơ bản (không join tên)"""
    return session.exec(
        select(Inventory).where(
            and_(
                Inventory.product_id == product_id,
                Inventory.warehouse_id == warehouse_id,
                Inventory.is_deleted.is_(False)
            )
        )
    ).first()
    
    