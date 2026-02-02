from sqlalchemy import create_engine, text
from backend.database import SQLALCHEMY_DATABASE_URL

def add_category_column():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        try:
            # Check if column exists (simple try-catch approach for SQLite/General SQL)
            conn.execute(text("SELECT category FROM items LIMIT 1"))
            print("Column 'category' already exists.")
        except Exception:
            print("Column 'category' does not exist. Adding...")
            conn.execute(text("ALTER TABLE items ADD COLUMN category VARCHAR"))
            print("Column 'category' added successfully.")

if __name__ == "__main__":
    add_category_column()
