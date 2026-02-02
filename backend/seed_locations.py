import httpx
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Prefecture, City

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed_locations():
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(Prefecture).count() > 0:
            print("Prefectures already seeded. Skipping.")
            return

        print("Fetching data from Geolonia...")
        url = "https://geolonia.github.io/japanese-addresses/api/ja.json"
        response = httpx.get(url)
        response.raise_for_status()
        data = response.json()

        print("Data fetched. Processing...")
        
        for pref_name, cities in data.items():
            # Prefecture processing
            pref = db.query(Prefecture).filter(Prefecture.name == pref_name).first()
            if not pref:
                pref = Prefecture(name=pref_name)
                db.add(pref)
                db.flush() # Insert and get ID
                print(f"Added Prefecture: {pref_name}")

            # City processing
            for city_name in cities:
                existing_city = db.query(City).filter(City.name == city_name, City.prefecture_id == pref.id).first()
                if not existing_city:
                    city = City(name=city_name, prefecture_id=pref.id)
                    db.add(city)
        
        db.commit()
        print("Seeding completed successfully!")

        # Verification
        pref_count = db.query(Prefecture).count()
        city_count = db.query(City).count()
        print(f"Total Prefectures: {pref_count}")
        print(f"Total Cities: {city_count}")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_locations()
