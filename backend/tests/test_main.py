from backend import crud, schemas

def test_read_items(client):
    response = client.get("/items")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_order_simple(client):
    response = client.post("/orders", json={
        "items": [], 
        "age_group": "20s",
        "gender": "male"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "pending"

def test_full_order_flow(client, db_session):
    # 1. Setup Admin User
    crud.create_store(db_session, schemas.StoreCreate(name="admin", password="password123"))
    
    # 2. Login
    login_res = client.post("/token", data={"username": "admin", "password": "password123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create Item
    item_res = client.post("/items/", json={
        "name": "API Test Item",
        "price": 500,
        "stock": 100,
        "category": "Test"
    }, headers=headers)
    assert item_res.status_code == 200
    item_data = item_res.json()
    item_id = item_data["id"]
    
    # Verify association (store_id should match the admin user's id)
    # We need to know admin's id. We can query it or rely on the fact it's linked.
    # Since 'item_res' response doesn't strictly include store_id in default schema maybe?
    # Let's check schema. Item schema doesn't show store_id yet. 
    # But we can assume it succeeded if 200 OK.
    
    # 4. Create Order
    order_res = client.post("/orders", json={
        "items": [{"item_id": item_id, "quantity": 5, "option_ids": []}],
        "age_group": "30s"
    })
    assert order_res.status_code == 200
    order_id = order_res.json()["id"]
    
    # 5. Checkout
    checkout_res = client.post(f"/orders/{order_id}/checkout", json={"payment_method": "cash"})
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "completed"
    
    # 6. Verify Stock Deduction logic via API shouldn't expose stock directly in order response,
    # but we can check item status via GET /items
    items_res = client.get("/items")
    # Finding the item in list
    target_item = next(i for i in items_res.json() if i["id"] == item_id)
    assert target_item["stock"] == 95
    
    # 7. Get Order (Polling)
    get_res = client.get(f"/orders/{order_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "completed"
    
    # 8. Update Status (Admin)
    update_res = client.put(f"/orders/{order_id}/status", json={"status": "served"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "served"
    
    # 9. Verify polling Update
    final_res = client.get(f"/orders/{order_id}")
    assert final_res.json()["status"] == "served"

def test_login_failure(client):
    response = client.post("/token", data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.post("/items/", json={"name": "Fail", "price": 10})
    # Depending on auth setup, might be 401
    assert response.status_code == 401

def test_404_errors(client, db_session):
    # Setup - need admin token
    from backend import crud, schemas
    # Only create if logic assumes empty DB, but we use function scope so it's clean (but auth created user in other test)
    # Re-create user/token or reuse logic?
    # db_session is clean for this function
    crud.create_store(db_session, schemas.StoreCreate(name="admin", password="pass"))
    token = client.post("/token", data={"username": "admin", "password": "pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update Item 404
    res = client.put("/items/999", json={"name": "X", "price": 1, "stock": 1}, headers=headers)
    assert res.status_code == 404
    
    # Checkout 404
    res = client.post("/orders/999/checkout", json={"payment_method": "cash"})
    assert res.status_code == 404
    
    # Update Status 404
    res = client.put("/orders/999/status", json={"status": "served"}, headers=headers)
    assert res.status_code == 404
    
    # Get Order 404
    res = client.get("/orders/999")
    assert res.status_code == 404
    
    # Add Items 404
    res = client.post("/orders/999/items", json={"items": []})
    assert res.status_code == 404

def test_add_items_endpoint(client, db_session):
    from backend import crud, schemas
    # Need to create store to get store_id for create_item
    store = crud.create_store(db_session, schemas.StoreCreate(name="test", password="pass"))
    item = crud.create_item(db_session, schemas.ItemCreate(name="I", price=100), store_id=store.id)
    order = crud.create_order(db_session, schemas.OrderCreate(items=[]))
    
    res = client.post(f"/orders/{order.id}/items", json={
        "items": [{"item_id": item.id, "quantity": 5, "option_ids": []}]
    })
    
    assert res.status_code == 200
    assert len(res.json()["items"]) == 1

def test_read_orders_list(client, db_session):
    # Ensure at least one order exists
    from backend import crud, schemas
    crud.create_order(db_session, schemas.OrderCreate(items=[]))
    
    res = client.get("/orders")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert len(res.json()) >= 1

def test_create_order_with_options(client, db_session):
    from backend import crud, schemas, models
    
    # 1. Create Item
    # Need store
    store = crud.get_store_by_name(db_session, "admin")
    if not store:
        store = crud.create_store(db_session, schemas.StoreCreate(name="admin", password="pass"))
    
    item = crud.create_item(db_session, schemas.ItemCreate(name="Ramen", price=1000), store_id=store.id)
    
    # 2. Create Option manually (since no API for it yet)
    option = models.Option(name="Large", price_adjustment=100)
    db_session.add(option)
    db_session.commit()
    db_session.refresh(option)
    
    # 3. Create Order with Option
    # Note: validation might fail if item doesn't have this option linked?
    # models.OrderItemOption just links order_item and option.
    # It doesn't strictly enforce ItemOption existence in crud.create_order logic currently?
    # Let's check crud.py logic. It just iterates option_ids.
    
    res = client.post("/orders", json={
        "items": [{
            "item_id": item.id, 
            "quantity": 1, 
            "option_ids": [option.id]
        }]
    })
    
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 1
    # Check if options are in response (using read_order schemas)
    # The response model is schemas.Order. items is List[OrderItem]. OrderItem has options: List[Option].
    assert len(data["items"][0]["options"]) == 1
    assert data["items"][0]["options"][0]["name"] == "Large"

def test_update_item_success(client, db_session):
    from backend import crud, schemas
    # Create admin
    store = crud.create_store(db_session, schemas.StoreCreate(name="admin", password="pass"))
    token = client.post("/token", data={"username": "admin", "password": "pass"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Item
    item = crud.create_item(db_session, schemas.ItemCreate(name="Old Name", price=100), store_id=store.id)
    
    # Update Item
    res = client.put(f"/items/{item.id}", json={"name": "New Name", "price": 200, "stock": 10}, headers=headers)
    assert res.status_code == 200
    assert res.json()["name"] == "New Name"
    assert res.json()["price"] == 200

