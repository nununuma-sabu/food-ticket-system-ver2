from backend.database import SessionLocal
from backend.models import Item, Store

def seed_items():
    db = SessionLocal()
    try:
        print("Starting item seeding...")
        
        # Determine store (Shinjuku)
        store = db.query(Store).filter(Store.name == "新宿店").first()
        if not store:
            print("Store '新宿店' not found. Please run seed_stores.py first.")
            return

        print(f"Seeding items for Store: {store.name} (ID: {store.id})")

        items_data = [
            {"name": "醤油ラーメン", "price": 780, "category": "麺類", "image_url": "https://placehold.co/400x300?text=Soy+Ramen"},
            {"name": "塩ラーメン", "price": 780, "category": "麺類", "image_url": "https://placehold.co/400x300?text=Salt+Ramen"},
            {"name": "味噌ラーメン", "price": 850, "category": "麺類", "image_url": "https://placehold.co/400x300?text=Miso+Ramen"},
            {"name": "チャーハン", "price": 600, "category": "ご飯もの", "image_url": "https://placehold.co/400x300?text=Fried+Rice"},
            {"name": "焼き餃子", "price": 400, "category": "単品", "image_url": "https://placehold.co/400x300?text=Gyoza"},
            {"name": "ライス", "price": 150, "category": "ご飯もの", "image_url": "https://placehold.co/400x300?text=Rice"},
            {"name": "唐揚げ定食", "price": 850, "category": "定食", "image_url": "https://placehold.co/400x300?text=Karaage+Set"},
            {"name": "コーラ", "price": 200, "category": "ドリンク", "image_url": "https://placehold.co/400x300?text=Cola"},
        ]

        for item_data in items_data:
            # Check if item exists in this store
            existing_item = db.query(Item).filter(Item.name == item_data["name"], Item.store_id == store.id).first()
            if not existing_item:
                new_item = Item(**item_data, store_id=store.id)
                db.add(new_item)
                print(f"Added item: {item_data['name']}")
            else:
                print(f"Item already exists: {item_data['name']}")
        
        db.commit()
        print("Item seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_items()
