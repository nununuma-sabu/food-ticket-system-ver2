import { useEffect } from 'react';

interface Props {
    onComplete: () => void;
}

export const ThankYouScreen = ({ onComplete }: Props) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff', // Changed from #222
            color: '#333', // Changed from white
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            animation: 'fadeIn 0.5s'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#646cff' }}>ありがとうございました！</h1>
            <p style={{ fontSize: '1.5rem', color: '#666' }}>またのお越しをお待ちしております。</p>
        </div>
    );
};
