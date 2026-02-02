import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface Props {
    message: string;
    type: NotificationType;
    visible: boolean;
    onClose: () => void;
}

export const Notification = ({ message, type, visible, onClose }: Props) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    if (!visible) return null;

    const backgroundColor =
        type === 'success' ? '#4caf50' :
            type === 'error' ? '#f44336' : '#2196f3';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor,
            color: 'white',
            padding: '16px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 2000,
            animation: 'fadeIn 0.3s'
        }}>
            {message}
        </div>
    );
};
