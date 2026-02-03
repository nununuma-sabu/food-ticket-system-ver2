from backend.database import SessionLocal
from backend.models import Option, Item, Store

def seed_options():
    db = SessionLocal()
    try:
        print("Starting option seeding...")
        
        # 1. Define Common Options
        options_data = [
            {"name": "大盛り", "price_adjustment": 100},
            {"name": "味玉", "price_adjustment": 100},
            {"name": "チャーシュー増量", "price_adjustment": 250},
            {"name": "ネギ抜き", "price_adjustment": 0},
            {"name": "麺硬め", "price_adjustment": 0},
        ]
        
        created_options = []
        for opt_data in options_data:
            existing = db.query(Option).filter(Option.name == opt_data["name"]).first()
            if not existing:
                opt = Option(**opt_data)
                db.add(opt)
                db.commit()
                db.refresh(opt)
                created_options.append(opt)
                print(f"Created option: {opt.name}")
            else:
                created_options.append(existing)
        
        # 2. Link Options to Items (specifically for Shinjuku Store)
        # Find Shinjuku Store
        store = db.query(Store).filter(Store.name == "新宿店").first()
        if not store:
            print("Shinjuku store not found! Please seed stores first.")
            return

        items = db.query(Item).filter(Item.store_id == store.id).all()
        
        for item in items:
            # Example logic: Add options to Ramen
            if "ラーメン" in item.name:
                for opt in created_options:
                    if opt not in item.options:
                        item.options.append(opt)
                print(f"Added options to {item.name}")
            
            # Example logic: Add "Large" to Rice
            if "ご飯" in item.name or "丼" in item.name:
                large = next((o for o in created_options if o.name == "大盛り"), None)
                if large and large not in item.options:
                    item.options.append(large)
        
        db.commit()
        print("Option seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_options()
