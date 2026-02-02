import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export const AdminLogin = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Using existing token endpoint but simpler for now
            // In a real app, we'd use a dedicated context or redux
            const formData = new FormData();
            formData.append('username', name);
            formData.append('password', password);

            const response = await api.post('/token', formData);

            // Store real token
            localStorage.setItem('admin_token', response.data.access_token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('ログインに失敗しました');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
        }}>
            <form onSubmit={handleLogin} style={{
                padding: '3rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>管理者ログイン</h2>

                {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ID</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>パスワード</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>

                <button type="submit" style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}>
                    ログイン
                </button>
            </form>
        </div>
    );
};
