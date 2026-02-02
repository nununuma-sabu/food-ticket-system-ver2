import type { Item, Option } from '../../types';

export interface CartItem extends Item {
    quantity: number;
    selected_options: Option[];
}

interface Props {
    items: CartItem[];
    onOrder: () => void;
    onClear: () => void;
}

export const Cart = ({ items, onOrder, onClear }: Props) => {
    const calculateItemPrice = (item: CartItem) => {
        const optionsPrice = item.selected_options.reduce((sum, opt) => sum + opt.price_adjustment, 0);
        return (item.price + optionsPrice) * item.quantity;
    };

    const total = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);

    if (items.length === 0) {
        return <div className="cart">カートは空です</div>;
    }

    return (
        <div className="cart">
            <h2>注文内容</h2>
            {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                    <div>
                        <span>{item.name} x {item.quantity}</span>
                        {item.selected_options.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#777', marginLeft: '1rem', marginTop: '2px' }}>
                                {item.selected_options.map(opt => (
                                    <span key={opt.id} style={{ display: 'block' }}>
                                        + {opt.name} ({opt.price_adjustment > 0 ? '+' : ''}{opt.price_adjustment.toLocaleString()}円)
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <span>¥{calculateItemPrice(item).toLocaleString()}</span>
                </div>
            ))}
            <h3 style={{ textAlign: 'right', marginTop: '1rem', color: '#333' }}>合計: ¥{total.toLocaleString()}</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={onClear} style={{ backgroundColor: '#fff', border: '1px solid #ccc', color: '#666', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>クリア</button>
                <button onClick={onOrder} style={{ backgroundColor: '#f0ad4e', border: 'none', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(240, 173, 78, 0.3)' }}>注文送信</button>
            </div>
        </div>
    );
};
