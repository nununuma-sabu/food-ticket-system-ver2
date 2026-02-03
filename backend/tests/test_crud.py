from backend import crud, schemas, models

def create_dummy_store(db):
    store = crud.get_store_by_name(db, "test_store")
    if not store:
        store = crud.create_store(db, schemas.StoreCreate(name="test_store", password="pass"))
    return store

def test_create_item(db_session):
    store = create_dummy_store(db_session)
    item_in = schemas.ItemCreate(name="Test Item", price=1000, category="Test", stock=10)
    item = crud.create_item(db_session, item_in, store_id=store.id)
    assert item.name == "Test Item"
    assert item.stock == 10
    assert item.id is not None
    assert item.store_id == store.id

def test_update_item(db_session):
    store = create_dummy_store(db_session)
    item_in = schemas.ItemCreate(name="Item 1", price=500, stock=5)
    item = crud.create_item(db_session, item_in, store_id=store.id)
    
    update_data = schemas.ItemCreate(name="Updated Item", price=600, stock=20)
    updated_item = crud.update_item(db_session, item.id, update_data)
    
    assert updated_item.name == "Updated Item"
    assert updated_item.stock == 20

def test_checkout_order_deducts_stock(db_session):
    store = create_dummy_store(db_session)
    # Setup item
    item_in = schemas.ItemCreate(name="Ramen", price=1000, stock=10)
    item = crud.create_item(db_session, item_in, store_id=store.id)
    
    # Setup order
    order_in = schemas.OrderCreate(items=[
        schemas.OrderItemCreate(item_id=item.id, quantity=2, option_ids=[])
    ])
    order = crud.create_order(db_session, order_in)
    
    # Checkout
    crud.checkout_order(db_session, order.id, "cash")
    
    # Verify stock
    db_item = db_session.query(models.Item).filter(models.Item.id == item.id).first()
    assert db_item.stock == 8
    
    # Verify order status
    db_order = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert db_order.status == models.OrderStatus.COMPLETED
    assert db_order.payment_method == "cash"

def test_checkout_double_payment_prevention(db_session):
    store = create_dummy_store(db_session)
    item = crud.create_item(db_session, schemas.ItemCreate(name="I", price=100, stock=10), store_id=store.id)
    order = crud.create_order(db_session, schemas.OrderCreate(items=[
        schemas.OrderItemCreate(item_id=item.id, quantity=1, option_ids=[])
    ]))
    
    # First checkout
    crud.checkout_order(db_session, order.id, "cash")
    item_stock_1 = db_session.query(models.Item).first().stock
    assert item_stock_1 == 9
    
    crud.checkout_order(db_session, order.id, "card")
    item_stock_2 = db_session.query(models.Item).first().stock
    assert item_stock_2 == 9 

def test_crud_not_found_cases(db_session):
    # Update item not found
    assert crud.update_item(db_session, 999, schemas.ItemCreate(name="X", price=1, stock=1)) is None
    
    # Checkout order not found
    assert crud.checkout_order(db_session, 999, "cash") is None
    
    # Update order status not found
    assert crud.update_order_status(db_session, 999, "completed") is None
    
    # Add items order not found
    assert crud.add_items_to_order(db_session, 999, []) is None

def test_add_items_to_order(db_session):
    store = create_dummy_store(db_session)
    item = crud.create_item(db_session, schemas.ItemCreate(name="Item", price=100), store_id=store.id)
    order = crud.create_order(db_session, schemas.OrderCreate(items=[]))
    
    order = crud.add_items_to_order(db_session, order.id, [
        schemas.OrderItemCreate(item_id=item.id, quantity=3, option_ids=[])
    ])
    
    assert len(order.items) == 1
    assert order.items[0].quantity == 3
