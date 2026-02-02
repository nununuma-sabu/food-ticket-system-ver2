import { useState, useEffect } from 'react';
import api from '../../api';
import type { Item } from '../../types';
import { useAuth } from '../auth/useAuth';

export const useMenu = () => {
    const [items, setItems] = useState<Item[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchItems = async () => {
            if (!token) return;

            try {
                const response = await api.get('/items', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setItems(response.data);
            } catch (error) {
                console.error('Failed to fetch items', error);
            }
        };
        fetchItems();
    }, [token]);

    return { items };
};
