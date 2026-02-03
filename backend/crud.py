from typing import List
from . import models, schemas, auth
from sqlalchemy.orm import Session, joinedload

def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).options(joinedload(models.Item.options)).offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate, store_id: int):
    db_item = models.Item(**item.dict(), store_id=store_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item: schemas.ItemCreate):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        return None
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_store_by_name(db: Session, name: str):
    return db.query(models.Store).filter(models.Store.name == name).first()

def get_store_by_code(db: Session, code: str):
    return db.query(models.Store).filter(models.Store.code == code).first()

def create_store(db: Session, store: schemas.StoreCreate):
    hashed_password = auth.get_password_hash(store.password)
    db_store = models.Store(name=store.name, hashed_password=hashed_password)
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order(
        status=models.OrderStatus.PENDING,
        age_group=order.age_group,
        gender=order.gender
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            item_id=item.item_id,
            quantity=item.quantity
        )
        db.add(db_order_item)
        db.commit() # Commit to get db_order_item.id
        db.refresh(db_order_item)

        for option_id in item.option_ids:
            db_order_item_option = models.OrderItemOption(
                order_item_id=db_order_item.id,
                option_id=option_id
            )
            db.add(db_order_item_option)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.item),
        joinedload(models.Order.items).joinedload(models.OrderItem.options)
    ).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()

def add_items_to_order(db: Session, order_id: int, items: List[schemas.OrderItemCreate]):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    for item in items:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            item_id=item.item_id,
            quantity=item.quantity
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def checkout_order(db: Session, order_id: int, payment_method: str):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    # Prevent double processing (Check payment_method instead of status)
    if db_order.payment_method is not None:
        return db_order
    
    # Sort items by ID to avoid deadlocks when locking rows
    sorted_items = sorted(db_order.items, key=lambda x: x.item_id)
    
    for order_item in sorted_items:
        # Acquire lock for the item to safely update stock
        # Note: with_for_update might be ignored by SQLite but is good practice for concurrency
        item = db.query(models.Item).filter(models.Item.id == order_item.item_id).with_for_update().first()
        if item:
            item.stock -= order_item.quantity

    db_order.payment_method = payment_method
    db_order.status = models.OrderStatus.COMPLETED
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: int, status: str):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: int):
    return db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.item),
        joinedload(models.Order.items).joinedload(models.OrderItem.options)
    ).filter(models.Order.id == order_id).first()
