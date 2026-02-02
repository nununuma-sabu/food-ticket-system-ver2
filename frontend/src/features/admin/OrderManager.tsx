import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Order } from '../../types';

export const OrderManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('http://localhost:8000/orders', config);
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Optional: Polling every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.put(`http://localhost:8000/orders/${orderId}/status`, { status: newStatus }, config);
            // Optimistic update or refresh
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("ステータス更新に失敗しました");
        }
    };

    // Calculate order total helper (since backend might not send total yet, or just to be safe)
    const calculateTotal = (order: Order) => {
        return order.items.reduce((sum, item) => {
            const itemPrice = item.item.price;
            const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price_adjustment, 0);
            return sum + (itemPrice + optionsPrice) * item.quantity;
        }, 0);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>📋 注文管理</h1>
                <button onClick={fetchOrders} style={refreshButtonStyle}>
                    🔄 更新
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.length === 0 ? <p>注文はまだありません</p> : orders.map(order => (
                        <div key={order.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>#{order.id}</span>
                                    <span style={{ marginLeft: '1rem', color: '#7f8c8d' }}>
                                        {new Date(order.created_at + 'Z').toLocaleString('ja-JP')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>
                                        ¥{calculateTotal(order).toLocaleString()}
                                    </span>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {order.items.map(item => (
                                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #f5f5f5' }}>
                                            <div>
                                                <span style={{ fontWeight: 'bold', color: '#555' }}>
                                                    {item.item.name} <span style={{ fontSize: '0.9em' }}>x{item.quantity}</span>
                                                </span>
                                                {item.options.length > 0 && (
                                                    <div style={{ fontSize: '0.85rem', color: '#777', paddingLeft: '1rem' }}>
                                                        {item.options.map(opt => (
                                                            <div key={opt.id}>+ {opt.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>{/* Price could go here */}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f9f9f9' }}>
                                {order.status !== 'completed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                                        style={{ ...actionButtonStyle, backgroundColor: '#27ae60' }}
                                    >
                                        ✅ 提供済みにする
                                    </button>
                                )}
                                {order.status === 'completed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'pending')}
                                        style={{ ...actionButtonStyle, backgroundColor: '#f39c12' }}
                                    >
                                        ↩️ 調理中に戻す
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const isCompleted = status === 'completed';
    const style: React.CSSProperties = {
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        backgroundColor: isCompleted ? '#e8f5e9' : '#fff3e0',
        color: isCompleted ? '#2e7d32' : '#ef6c00',
        border: `1px solid ${isCompleted ? '#a5d6a7' : '#ffcc80'}`
    };
    return <span style={style}>{isCompleted ? '提供済み' : '調理中'}</span>;
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #eaeaea'
};

const actionButtonStyle: React.CSSProperties = {
    padding: '0.6rem 1.2rem',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
    fontSize: '0.9rem'
};

const refreshButtonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};
