from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.database import SessionLocal, engine, Base
from backend import models, schemas, crud

# Create tables
Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    
    # Create default store if not exists
    store = crud.get_store_by_name(db, name="admin")
    if not store:
        crud.create_store(db, schemas.StoreCreate(name="admin", password="password123"))
        print("Seeded default store user.")

    # Define Items Data
    items_data = [
        {"name": "醤油ラーメン", "price": 800, "image_url": "https://placehold.co/400x300?text=Ramen", "category": "麺類"},
        {"name": "味噌ラーメン", "price": 850, "image_url": "https://placehold.co/400x300?text=Miso+Ramen", "category": "麺類"},
        {"name": "チャーシューメン", "price": 1000, "image_url": "https://placehold.co/400x300?text=Chashu", "category": "麺類"},
        {"name": "餃子", "price": 400, "image_url": "https://placehold.co/400x300?text=Gyoza", "category": "単品"},
        {"name": "チャーハン", "price": 600, "image_url": "https://placehold.co/400x300?text=Fried+Rice", "category": "ご飯もの"},
        {"name": "ビール", "price": 500, "image_url": "https://placehold.co/400x300?text=Beer", "category": "ドリンク"},
        {"name": "唐揚げ", "price": 450, "image_url": "https://placehold.co/400x300?text=Fried+Chicken", "category": "単品"},
        {"name": "ライス", "price": 150, "image_url": "https://placehold.co/400x300?text=Rice", "category": "ご飯もの"},
    ]

    for item_data in items_data:
        existing_item = db.query(models.Item).filter(models.Item.name == item_data["name"]).first()
        if existing_item:
            # Update existing item image_url and category
            print(f"Updating item: {existing_item.name}")
            existing_item.image_url = item_data["image_url"]
            existing_item.category = item_data["category"]
        else:
            # Create new item
            print(f"Creating item {item_data['name']}")
            new_item = models.Item(**item_data)
            db.add(new_item)
    
    db.commit()
    print("Items synced.")

    # Seed Options
    options = [
        models.Option(name="大盛", price_adjustment=100),
        models.Option(name="特盛", price_adjustment=200),
        models.Option(name="少なめ", price_adjustment=-50),
    ]

    for option in options:
        existing_option = db.query(models.Option).filter(models.Option.name == option.name).first()
        if not existing_option:
            db.add(option)
    
    db.commit()

    # Link Options to Items (Example: Ramen gets Large/Extra Large/Small options)
    # Re-query items and options to get IDs
    ramen_items = db.query(models.Item).filter(models.Item.name.like("%ラーメン%")).all()
    rice_item = db.query(models.Item).filter(models.Item.name == "ライス").first()
    炒飯_item = db.query(models.Item).filter(models.Item.name == "チャーハン").first()
    
    all_options = db.query(models.Option).all()
    print(f"Found options: {len(all_options)}")

    target_items = ramen_items + ([rice_item] if rice_item else []) + ([炒飯_item] if 炒飯_item else [])
    print(f"Target items count: {len(target_items)}")
    for i in target_items:
        print(f"Target: {i.name}")

    for item in target_items:
        for option in all_options:
            # Check if link exists
            link = db.query(models.ItemOption).filter_by(item_id=item.id, option_id=option.id).first()
            if not link:
                item_option = models.ItemOption(item_id=item.id, option_id=option.id)
                db.add(item_option)
    
    db.commit()
    print("Seeded items and options.")
    db.close()

if __name__ == "__main__":
    init_db()
