from sqlalchemy import create_engine, text
from backend.database import SQLALCHEMY_DATABASE_URL

def add_stock_column():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT stock FROM items LIMIT 1"))
            print("Column 'stock' already exists.")
        except Exception:
            print("Column 'stock' does not exist. Adding...")
            # Default stock 10
            conn.execute(text("ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT 10"))
            print("Column 'stock' added successfully.")

if __name__ == "__main__":
    add_stock_column()
