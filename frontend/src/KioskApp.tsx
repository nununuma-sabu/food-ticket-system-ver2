import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from './features/menu/MenuItem';
import { Cart } from './features/cart/Cart';
import { OrderHistory } from './features/order/OrderHistory';
import { PaymentModal } from './features/payment/PaymentModal';
// import { ThankYouScreen } from './features/payment/ThankYouScreen'; // Replaced by TicketScreen
import { TicketScreen } from './features/ticket/TicketScreen';
import { StandbyScreen } from './features/standby/StandbyScreen';
import { Notification } from './features/notification/Notification';
import { LoginScreen } from './features/auth/LoginScreen';
import { useAuth } from './features/auth/useAuth';
import { FaceAuthScreen } from './features/auth/FaceAuthScreen';

// Hooks
import { useMenu } from './features/menu/useMenu';
import { useCart } from './features/cart/useCart';
import { useOrderSession } from './features/order/useOrderSession';
import { useNotification } from './features/notification/useNotification';

export const KioskApp = () => {
    // Add TICKET state
    const [appState, setAppState] = useState<'LOGIN' | 'STANDBY' | 'FACE_AUTH' | 'ORDERING' | 'TICKET'>('LOGIN');
    const [selectedCategory, setSelectedCategory] = useState<string>('全体');
    // Track the last confirmed order to show on ticket
    // sessionOrders is an array, we might want to show the specific order just paid or all?
    // Usually Ticket Screen shows "What you just bought".
    // Since checkout completes the *session* in simple flow, sessionOrders might be cleared in completeSession.
    // We need to capture the current orders before clearing.

    // Actually, useOrderSession might clear sessionOrders on completeSession.
    // Let's assume sessionOrders persists until completeSession is called.

    const { isAuthenticated } = useAuth();
    const { items } = useMenu();
    const { cart, addToCart, clearCart } = useCart();
    const {
        sessionOrders,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        // isThankYouVisible, // We won't use the simple ThankYouScreen hook state
        completeSession,
        sendOrder,
        checkout,
        sessionTotal,
        setCustomerAttributes
    } = useOrderSession();
    const { notification, showNotification, closeNotification } = useNotification();

    const categories = ['全体', '麺類', '定食', 'ご飯もの', '単品', 'ドリンク'];

    const filteredItems = items.filter(item => {
        if (selectedCategory === '全体') return true;
        return item.category === selectedCategory;
    });

    useEffect(() => {
        if (isAuthenticated && appState === 'LOGIN') {
            setAppState('STANDBY');
        } else if (!isAuthenticated) {
            setAppState('LOGIN');
        }
    }, [isAuthenticated]);

    const handleOrderClick = async () => {
        try {
            await sendOrder(cart, clearCart);
            showNotification('厨房へ送信しました！', 'success');
        } catch (e) {
            showNotification('注文送信に失敗しました', 'error');
        }
    };

    const handleCheckout = async (method: string) => {
        try {
            await checkout(method);
            // Instead of auto-completing, go to Ticket Screen
            setAppState('TICKET');
            setIsPaymentModalOpen(false);
        } catch (e) {
            showNotification('お支払いに失敗しました', 'error');
        }
    };

    const handleTicketComplete = useCallback(() => {
        completeSession(); // Clean up session
        setAppState('STANDBY');
    }, [completeSession]);

    if (!isAuthenticated || appState === 'LOGIN') {
        return <LoginScreen onLoginSuccess={() => setAppState('STANDBY')} />;
    }

    if (appState === 'STANDBY') {
        return <StandbyScreen onStart={() => setAppState('FACE_AUTH')} />;
    }

    if (appState === 'FACE_AUTH') {
        return (
            <FaceAuthScreen
                onComplete={(ageGroup, gender) => {
                    setCustomerAttributes({ ageGroup, gender });
                    setAppState('ORDERING');
                }}
            />
        );
    }

    if (appState === 'TICKET') {
        // Show the most recent order or merged session orders?
        // Let's show the last one for simplicity, or we should merge them visually.
        // For ticket: ideally one ticket per "Order" or summary.
        // Let's pass the last order in sessionOrders if available.
        const lastOrder = sessionOrders.length > 0 ? sessionOrders[sessionOrders.length - 1] : null;
        return <TicketScreen order={lastOrder} onComplete={handleTicketComplete} />;
    }

    return (
        <div className="container">
            <div className="main-content">
                <h1>食券機システム</h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '30px',
                                border: 'none',
                                backgroundColor: selectedCategory === category ? '#646cff' : '#eee',
                                color: selectedCategory === category ? 'white' : '#555',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                boxShadow: selectedCategory === category ? '0 4px 10px rgba(100, 108, 255, 0.4)' : 'none'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="menu-list">
                    {filteredItems.map((item) => (
                        <MenuItem key={item.id} item={item} onAdd={addToCart} />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        <p>該当する商品はありません</p>
                    </div>
                )}
            </div>
            <div className="sidebar">
                <Cart items={cart} onOrder={handleOrderClick} onClear={clearCart} />

                {sessionOrders.length > 0 && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #555', paddingTop: '1rem' }}>
                        <h2>お食事中</h2>
                        <OrderHistory orders={sessionOrders} />
                        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                            <h3>お支払い合計: ¥{sessionTotal.toLocaleString()}</h3>
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                style={{
                                    backgroundColor: '#d9534f',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '1rem 2rem',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    marginTop: '0.5rem'
                                }}
                            >
                                お会計に進む
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isPaymentModalOpen && sessionOrders.length > 0 && (
                <PaymentModal
                    total={sessionTotal}
                    onConfirm={handleCheckout}
                    onCancel={() => setIsPaymentModalOpen(false)}
                />
            )}
            <Notification
                message={notification.message}
                type={notification.type}
                visible={notification.visible}
                onClose={closeNotification}
            />
            {/* Removed ThankYouScreen in favor of TicketScreen */}
        </div>
    );
};
