from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

def fix_duplicates():
    db = SessionLocal()
    
    # Target duplicate name
    target_name = "少なめ"
    
    options = db.query(models.Option).filter(models.Option.name == target_name).all()
    
    if len(options) <= 1:
        print(f"No duplicates found for '{target_name}'. Count: {len(options)}")
        return

    print(f"Found {len(options)} duplicate options for '{target_name}'. Fixing...")
    
    # Kepp the first one (usually the oldest id, or just the first in list)
    # Ideally we keep the one that was 'correct' or has more links, but here they are likely identical in content
    primary_option = options[0]
    duplicates = options[1:]
    
    print(f"Keeping Option ID: {primary_option.id}")
    
    for dup in duplicates:
        print(f"Processing Duplicate Option ID: {dup.id}")
        
        # 1. Update ItemOption links
        item_links = db.query(models.ItemOption).filter(models.ItemOption.option_id == dup.id).all()
        for link in item_links:
            # Check if primary already has this link
            existing_link = db.query(models.ItemOption).filter_by(item_id=link.item_id, option_id=primary_option.id).first()
            if not existing_link:
                # Re-link to primary
                new_link = models.ItemOption(item_id=link.item_id, option_id=primary_option.id)
                db.add(new_link)
            # Delete old link
            db.delete(link)
            
        # 2. Update OrderItemOption links
        order_links = db.query(models.OrderItemOption).filter(models.OrderItemOption.option_id == dup.id).all()
        for link in order_links:
            # Just update the option_id to primary
            # (Assuming one order item doesn't have the same option twice, which shouldn't happen normally)
            link.option_id = primary_option.id
            db.add(link)
            
        # 3. Delete the duplicate option
        db.delete(dup)
        
    db.commit()
    print("Duplicates fixed.")
    db.close()

if __name__ == "__main__":
    fix_duplicates()
