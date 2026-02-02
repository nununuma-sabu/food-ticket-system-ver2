import { useState, useCallback } from 'react';
import type { NotificationType } from './Notification';

export const useNotification = () => {
    const [notification, setNotification] = useState<{
        visible: boolean;
        message: string;
        type: NotificationType;
    }>({
        visible: false,
        message: '',
        type: 'info',
    });

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        setNotification({ visible: true, message, type });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
    }, []);

    return { notification, showNotification, closeNotification };
};
