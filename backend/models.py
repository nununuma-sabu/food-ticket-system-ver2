from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True, index=True)
    stock = Column(Integer, default=10) # Default stock for existing items
    store_id = Column(Integer, ForeignKey("stores.id"))
    
    store = relationship("Store")

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # login_id
    name = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    address = Column(String, nullable=True)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default=OrderStatus.PENDING)
    payment_method = Column(String, nullable=True)
    age_group = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer)

    order = relationship("Order", back_populates="items")
    item = relationship("Item")
    options = relationship("Option", secondary="order_item_options")

class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price_adjustment = Column(Integer) # Can be negative for discounts

class ItemOption(Base):
    __tablename__ = "item_options"

    item_id = Column(Integer, ForeignKey("items.id"), primary_key=True)
    option_id = Column(Integer, ForeignKey("options.id"), primary_key=True)

class OrderItemOption(Base):
    __tablename__ = "order_item_options"

    order_item_id = Column(Integer, ForeignKey("order_items.id"), primary_key=True)
    option_id = Column(Integer, ForeignKey("options.id"), primary_key=True)


class Prefecture(Base):
    __tablename__ = "prefectures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    cities = relationship("City", back_populates="prefecture")

class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    prefecture_id = Column(Integer, ForeignKey("prefectures.id"))

    prefecture = relationship("Prefecture", back_populates="cities")

# Add relationship to Item
Item.options = relationship("Option", secondary="item_options")
