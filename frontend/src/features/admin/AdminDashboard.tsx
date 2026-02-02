import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Order } from '../../types';

export const AdminDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        todaySales: 0,
        todayOrders: 0,
        topItem: '-'
    });
    const [ranking, setRanking] = useState<{ name: string, count: number, sales: number }[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:8000/orders');
                const allOrders: Order[] = res.data;

                // Filter for today's orders (Local time)
                const today = new Date().toLocaleDateString('ja-JP');
                const todayOrders = allOrders.filter(order => {
                    // order.created_at is UTC string e.g. "2023-10-27T10:00:00"
                    // Need to treat it properly. Assuming backend stores UTC.
                    const orderDate = new Date(order.created_at + 'Z').toLocaleDateString('ja-JP');
                    return orderDate === today;
                });

                // Calculate Stats
                let sales = 0;
                const itemCounts: { [key: string]: number } = {};
                const itemSales: { [key: string]: number } = {};

                todayOrders.forEach(order => {
                    let orderTotal = 0;
                    order.items.forEach(item => {
                        const itemPrice = item.item.price;
                        const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price_adjustment, 0);
                        const lineTotal = (itemPrice + optionsPrice) * item.quantity;
                        orderTotal += lineTotal;

                        // Ranking data
                        itemCounts[item.item.name] = (itemCounts[item.item.name] || 0) + item.quantity;
                        itemSales[item.item.name] = (itemSales[item.item.name] || 0) + lineTotal;
                    });
                    sales += orderTotal;
                });

                // Determine Top Item
                let topItemName = '-';
                let maxCount = 0;
                Object.entries(itemCounts).forEach(([name, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        topItemName = name;
                    }
                });

                setStats({
                    todaySales: sales,
                    todayOrders: todayOrders.length,
                    topItem: topItemName
                });

                setOrders(todayOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

                // Ranking List
                const rankingList = Object.entries(itemCounts).map(([name, count]) => ({
                    name,
                    count,
                    sales: itemSales[name]
                })).sort((a, b) => b.count - a.count);

                setRanking(rankingList);

            } catch (e) {
                console.error(e);
            }
        };

        fetchOrders();
    }, []);

    // Helper to calculate order total
    const calculateOrderTotal = (order: Order) => {
        return order.items.reduce((sum, item) => {
            const itemPrice = item.item.price;
            const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price_adjustment, 0);
            return sum + (itemPrice + optionsPrice) * item.quantity;
        }, 0);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>ダッシュボード</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: 0, color: '#7f8c8d' }}>本日の売上</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#27ae60' }}>
                        ¥{stats.todaySales.toLocaleString()}
                    </p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ margin: 0, color: '#7f8c8d' }}>注文数</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#2980b9' }}>
                        {stats.todayOrders}件
                    </p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ margin: 0, color: '#7f8c8d' }}>人気No.1</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#e67e22' }}>
                        {stats.topItem}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Ranking */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>👑 本日の人気ランキング</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>順位</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>商品名</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>数量</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>売上</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>データなし</td></tr>
                            ) : (
                                ranking.map((item, index) => (
                                    <tr key={item.name} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                                            {index + 1}
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>{item.count}</td>
                                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>¥{item.sales.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Recent Orders */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>🕒 最近の注文 (本日)</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>まだ注文はありません</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#555' }}>
                                            #{order.id} <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem' }}>
                                                {new Date(order.created_at + 'Z').toLocaleTimeString('ja-JP')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
                                            {order.items.map(i => `${i.item.name} x${i.quantity}`).join(', ')}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            ¥{calculateOrderTotal(order).toLocaleString()}
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            backgroundColor: order.status === 'completed' ? '#f6ffed' : '#fff7e6',
                                            color: order.status === 'completed' ? '#52c41a' : '#fa8c16',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};
