import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Item } from '../../types';

export const ItemManager = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('単品');
    const [stock, setStock] = useState(0);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:8000/items'); // Removed trailing slash
            setItems(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setName(item.name);
        setPrice(item.price);
        setCategory(item.category || '単品');
        setStock(item.stock);
        setImageUrl(item.image_url || '');
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setName('');
        setPrice(0);
        setCategory('単品');
        setStock(10);
        setImageUrl('https://placehold.co/400x300?text=New+Item');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const itemData = {
                name,
                price: Number(price),
                category,
                stock: Number(stock),
                image_url: imageUrl
            };

            if (editingItem && editingItem.id) {
                // Update
                await axios.put(`http://localhost:8000/items/${editingItem.id}`, itemData, config);
            } else {
                // Create
                await axios.post('http://localhost:8000/items/', itemData, config);
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            alert('保存に失敗しました');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>商品管理</h1>
                <button onClick={handleCreate} style={primaryButtonStyle}>+ 新規商品追加</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>画像</th>
                            <th style={thStyle}>商品名</th>
                            <th style={thStyle}>カテゴリ</th>
                            <th style={thStyle}>価格</th>
                            <th style={thStyle}>在庫</th>
                            <th style={thStyle}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                                <td style={tdStyle}>#{item.id}</td>
                                <td style={tdStyle}>
                                    <img src={item.image_url} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={tdStyle}><strong>{item.name}</strong></td>
                                <td style={tdStyle}>
                                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#eef2ff', color: '#646cff', borderRadius: '20px', fontSize: '0.85rem' }}>
                                        {item.category}
                                    </span>
                                </td>
                                <td style={tdStyle}>¥{item.price.toLocaleString()}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        color: item.stock < 5 ? '#e74c3c' : '#27ae60',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.stock}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleEdit(item)} style={editButtonStyle}>編集</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>{editingItem ? '商品を編集' : '新規商品追加'}</h2>
                        <form onSubmit={handleSave}>
                            <div style={formGroupStyle}>
                                <label>商品名</label>
                                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={formGroupStyle}>
                                    <label>価格</label>
                                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>在庫数</label>
                                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} style={inputStyle} required />
                                </div>
                            </div>
                            <div style={formGroupStyle}>
                                <label>カテゴリ</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                                    {['麺類', '定食', 'ご飯もの', '単品', 'ドリンク'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={formGroupStyle}>
                                <label>画像URL</label>
                                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>キャンセル</button>
                                <button type="submit" style={primaryButtonStyle}>保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const thStyle: React.CSSProperties = { padding: '1rem', textAlign: 'left', color: '#666', fontSize: '0.9rem' };
const tdStyle: React.CSSProperties = { padding: '1rem' };
const primaryButtonStyle: React.CSSProperties = { backgroundColor: '#646cff', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const editButtonStyle: React.CSSProperties = { backgroundColor: 'white', border: '1px solid #ddd', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', color: '#555' };
const cancelButtonStyle: React.CSSProperties = { backgroundColor: '#f8f9fa', border: '1px solid #ddd', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', color: '#555' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%' };
const formGroupStyle: React.CSSProperties = { marginBottom: '1rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '0.25rem' };
