import React, { useEffect } from 'react';
import type { Order } from '../../types';

interface Props {
    order: Order | null;
    onComplete: () => void;
}

export const TicketScreen = ({ order, onComplete }: Props) => {
    // Auto-close after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 8000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!order) return null;

    // Use order ID as mockup calling number (last 3 digits)
    const callNumber = order.id.toString().slice(-3).padStart(3, '0');

    return (
        <div style={containerStyle}>
            <div style={ticketStyle}>
                <h2 style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>ご来店ありがとうございました。</h2>

                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>来店番号</p>
                    <div style={numberStyle}>{callNumber}</div>
                </div>

                <div style={listStyle}>
                    {order.items.map((item, idx) => (
                        <div key={idx} style={itemStyle}>
                            <span>{item.item.name} x{item.quantity}</span>
                            {item.options && item.options.length > 0 && (
                                <div style={optionStyle}>
                                    {item.options.map(o => o.name).join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
                    番号が呼ばれるまでお待ち下さい。<br />
                    この画面は自動で閉じます。
                </p>

                <button onClick={onComplete} style={closeButtonStyle}>
                    トップへ戻る
                </button>
            </div>
        </div>
    );
};

// Styles
const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#646cff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000
};

const ticketStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column'
};

const numberStyle: React.CSSProperties = {
    fontSize: '5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 1,
    margin: '1rem 0',
    fontFamily: 'monospace'
};

const listStyle: React.CSSProperties = {
    borderTop: '2px dashed #ddd',
    borderBottom: '2px dashed #ddd',
    padding: '1rem 0',
    marginBottom: '1rem',
    maxHeight: '300px',
    overflowY: 'auto'
};

const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0.5rem',
    fontSize: '1.1rem'
};

const optionStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#666',
    marginLeft: '1rem'
};

const closeButtonStyle: React.CSSProperties = {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#333'
};
