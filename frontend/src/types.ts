export interface Option {
    id: number;
    name: string;
    price_adjustment: number;
}

export interface Item {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
    stock: number;
    options: Option[];
}

export interface OrderItemRequest {
    item_id: number;
    quantity: number;
    option_ids: number[];
}

export interface OrderCreateRequest {
    items: OrderItemRequest[];
    age_group?: string;
    gender?: string;
}

export interface OrderCheckoutRequest {
    payment_method: string;
}

export interface OrderItem {
    id: number;
    item: Item;
    quantity: number;
    options: Option[];
}

export interface Order {
    id: number;
    created_at: string;
    status: string;
    payment_method: string | null;
    items: OrderItem[];
    session_total?: number; // Calculated on frontend or separate
}
// Updated type definitions
