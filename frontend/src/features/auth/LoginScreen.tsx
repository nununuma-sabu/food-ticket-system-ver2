import React, { useState } from 'react';
import api from '../../api';
import { useAuth } from './useAuth';

interface Props {
    onLoginSuccess: () => void;
}

export const LoginScreen = ({ onLoginSuccess }: Props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            login(response.data.access_token);
            onLoginSuccess();
        } catch (err) {
            setError('ログインに失敗しました。IDまたはパスワードを確認してください。');
            console.error(err);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            color: '#333'
        }}>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '2.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '350px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                border: '1px solid #e0e0e0'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#2c3e50' }}>店舗ログイン</h2>
                {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
                <div>
                    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>店舗ID</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginTop: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: '#fafafa',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>パスワード</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginTop: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: '#fafafa',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <button type="submit" style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f0ad4e',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px rgba(240, 173, 78, 0.3)',
                    transition: 'transform 0.1s'
                }}>
                    ログイン
                </button>
            </form>
        </div>
    );
};
