import type { Order } from '../../types';

interface Props {
    orders: Order[];
}

export const OrderHistory = ({ orders }: Props) => {
    if (orders.length === 0) return null;

    return (
        <div className="order-history">
            <h2>これまでの注文</h2>
            {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>注文 #{order.id} <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#999' }}>({new Date(order.created_at + 'Z').toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })})</span></span>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: order.status === 'completed' ? '#f6ffed' : '#fff7e6',
                            color: order.status === 'completed' ? '#52c41a' : '#fa8c16',
                            border: `1px solid ${order.status === 'completed' ? '#b7eb8f' : '#ffd591'}`,
                            fontSize: '0.85rem'
                        }}>
                            {order.status === 'completed' ? '提供済み' : '調理中...'}
                        </span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {order.items.map(oi => (
                            <li key={oi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #f5f5f5' }}>
                                <div>
                                    <span style={{ color: '#333' }}>{oi.item.name} x {oi.quantity}</span>
                                    {oi.options && oi.options.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', color: '#777', marginLeft: '10px', marginTop: '2px' }}>
                                            {oi.options.map(opt => (
                                                <span key={opt.id} style={{ display: 'block' }}>
                                                    + {opt.name} ({opt.price_adjustment > 0 ? '+' : ''}{opt.price_adjustment.toLocaleString()}円)
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}
