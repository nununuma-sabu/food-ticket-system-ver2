from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Item, Store

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

MENU_ITEMS = [
    {"name": "醤油ラーメン", "price": 780, "category": "麺類", "stock": 50},
    {"name": "塩ラーメン", "price": 780, "category": "麺類", "stock": 50},
    {"name": "味噌ラーメン", "price": 850, "category": "麺類", "stock": 50},
    {"name": "餃子", "price": 350, "category": "サイドメニュー", "stock": 100},
    {"name": "ライス", "price": 150, "category": "サイドメニュー", "stock": 100},
    {"name": "味玉", "price": 100, "category": "トッピング", "stock": 50},
    {"name": "チャーシュー", "price": 250, "category": "トッピング", "stock": 30},
    {"name": "ビール", "price": 500, "category": "ドリンク", "stock": 100},
]

def seed_items():
    db = SessionLocal()
    try:
        print("Starting menu seeding for Shinjuku Store...")
        
        # Find Shinjuku Store
        shinjuku_store = db.query(Store).filter(Store.name == "新宿店").first()
        if not shinjuku_store:
            print("Error: Shinjuku Store (新宿店) not found! Please run seed_stores.py first.")
            return

        print(f"Found store: {shinjuku_store.name} (ID: {shinjuku_store.id})")

        for item_data in MENU_ITEMS:
            # Check if item already exists for this store
            existing_item = db.query(Item).filter(
                Item.name == item_data["name"],
                Item.store_id == shinjuku_store.id
            ).first()

            if not existing_item:
                new_item = Item(
                    name=item_data["name"],
                    price=item_data["price"],
                    category=item_data["category"],
                    stock=item_data["stock"],
                    store_id=shinjuku_store.id
                )
                db.add(new_item)
                print(f"Added item: {item_data['name']}")
            else:
                print(f"Item already exists: {item_data['name']}")
        
        db.commit()
        print("Menu seeding completed successfully!")

        # Verification
        count = db.query(Item).filter(Item.store_id == shinjuku_store.id).count()
        print(f"Total Items for {shinjuku_store.name}: {count}")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_items()
