from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Store
from backend.auth import get_password_hash


# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

WARD_OFFICES = [
    {"name": "千代田店", "address": "千代田区九段南1-2-1"},
    {"name": "中央店", "address": "中央区築地1-1-1"},
    {"name": "港店", "address": "港区芝公園1-5-25"},
    {"name": "新宿店", "address": "新宿区歌舞伎町1-4-1"},
    {"name": "文京店", "address": "文京区春日1-16-21"},
    {"name": "台東店", "address": "台東区東上野4-5-6"},
    {"name": "墨田店", "address": "墨田区吾妻橋1-23-20"},
    {"name": "江東店", "address": "江東区東陽4-11-28"},
    {"name": "品川店", "address": "品川区広町2-1-36"},
    {"name": "目黒店", "address": "目黒区上目黒2-19-15"},
    {"name": "大田店", "address": "大田区蒲田5-13-14"},
    {"name": "世田谷店", "address": "世田谷区世田谷4-21-27"},
    {"name": "渋谷店", "address": "渋谷区宇田川町1-1"},
    {"name": "中野店", "address": "中野区中野4-8-1"},
    {"name": "杉並店", "address": "杉並区阿佐谷南1-15-1"},
    {"name": "豊島店", "address": "豊島区南池袋2-45-1"},
    {"name": "北店", "address": "北区王子本町1-15-22"},
    {"name": "荒川店", "address": "荒川区荒川2-2-3"},
    {"name": "板橋店", "address": "板橋区板橋2-66-1"},
    {"name": "練馬店", "address": "練馬区豊玉北6-12-1"},
    {"name": "足立店", "address": "足立区中央本町1-17-1"},
    {"name": "葛飾店", "address": "葛飾区立石5-13-1"},
    {"name": "江戸川店", "address": "江戸川区中央1-4-1"},
]

def seed_stores():
    db = SessionLocal()
    try:
        print("Starting store seeding...")

        
        default_password_hash = get_password_hash("password")

        for idx, office in enumerate(WARD_OFFICES):
            store_name = office["name"]
            address = office["address"]
            # ID rules: 1000 + idx + 1 (e.g., 1001, 1002...)
            store_code = str(1001 + idx)

            existing_store = db.query(Store).filter(Store.name == store_name).first()
            if not existing_store:
                new_store = Store(
                    name=store_name,
                    code=store_code,
                    hashed_password=default_password_hash,
                    address=address
                )
                db.add(new_store)
                print(f"Added store: {store_name} (Code: {store_code})")
            else:
                # Update code if missing
                if not existing_store.code:
                    existing_store.code = store_code
                    print(f"Updated code for: {store_name} -> {store_code}")
                # Update address if it's missing
                if not existing_store.address:
                    existing_store.address = address
                    print(f"Updated address for: {store_name}")
                
        db.commit()
        print("Store seeding completed successfully!")

        # Verification
        count = db.query(Store).count()
        print(f"Total Stores: {count}")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_stores()
