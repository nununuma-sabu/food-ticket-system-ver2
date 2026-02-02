import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'ダッシュボード' },
        { path: '/admin/orders', icon: '📋', label: '注文管理' },
        { path: '/admin/items', icon: '🍜', label: '商品管理' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div style={{
                width: '250px',
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ marginBottom: '3rem', textAlign: 'center' }}>管理画面</h2>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map(item => {
                            // Check if current path starts with item path (e.g. /admin/items/new should highlight items)
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <li key={item.path} style={{ marginBottom: '1rem' }}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            display: 'block',
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            transition: 'background-color 0.2s',
                                            border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent'
                                        }}
                                    >
                                        {item.icon} {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        ログアウト
                    </button>
                    <Link to="/" style={{ display: 'block', textAlign: 'center', color: '#bdc3c7', marginTop: '1rem', fontSize: '0.9rem' }}>
                        食券機アプリへ戻る
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, backgroundColor: '#f4f6f8', padding: '2rem', overflowY: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
};
