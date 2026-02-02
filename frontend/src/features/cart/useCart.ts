import { useState, useCallback } from 'react';
import type { Item, Option } from '../../types';
import type { CartItem } from './Cart';

export const useCart = () => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((item: Item, selectedOptions: Option[] = []) => {
        setCart((prev) => {
            // Check if same item with same options exists
            const existingIndex = prev.findIndex((i) => {
                if (i.id !== item.id) return false;
                if (i.selected_options.length !== selectedOptions.length) return false;

                const currentOptIds = i.selected_options.map(o => o.id).sort();
                const newOptIds = selectedOptions.map(o => o.id).sort();

                return currentOptIds.every((val, index) => val === newOptIds[index]);
            });

            if (existingIndex >= 0) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }

            return [...prev, { ...item, quantity: 1, selected_options: selectedOptions }];
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartTotal = cart.reduce((sum, item) => {
        const optionsPrice = item.selected_options.reduce((optSum, opt) => optSum + opt.price_adjustment, 0);
        return sum + (item.price + optionsPrice) * item.quantity;
    }, 0);

    return { cart, addToCart, clearCart, cartTotal };
};
