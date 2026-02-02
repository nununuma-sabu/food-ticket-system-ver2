from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class StoreBase(BaseModel):
    name: str

class StoreCreate(StoreBase):
    password: str

class Store(StoreBase):
    id: int
    
    class Config:
        from_attributes = True

class OptionBase(BaseModel):
    name: str
    price_adjustment: int

class OptionCreate(OptionBase):
    pass

class Option(OptionBase):
    id: int

    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    name: str
    price: int
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: int = 10

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    options: List[Option] = []

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    item_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    option_ids: List[int] = []

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    item: Item
    options: List[Option] = []

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    pass

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    age_group: Optional[str] = None
    gender: Optional[str] = None

class OrderCheckout(BaseModel):
    payment_method: str

class OrderStatusUpdate(BaseModel):
    status: str

class OrderAddItems(BaseModel):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    created_at: datetime
    status: str
    payment_method: Optional[str] = None
    age_group: Optional[str] = None
    gender: Optional[str] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
