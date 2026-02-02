import { useState, useCallback, useEffect } from 'react';
import api from '../../api';
import type { Order, OrderItemRequest } from '../../types';
import type { CartItem } from '../cart/Cart';

export const useOrderSession = () => {
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isThankYouVisible, setIsThankYouVisible] = useState(false);
    const [customerAttributes, setCustomerAttributes] = useState<{ ageGroup: string; gender: string } | null>(null);

    // Polling for status updates
    useEffect(() => {
        if (!currentOrderId) return;

        const pollOrder = async () => {
            try {
                const res = await api.get<Order>(`/orders/${currentOrderId}`);
                setSessionOrders(prev => {
                    return prev.map(o => o.id === currentOrderId ? res.data : o);
                });
            } catch (e) {
                console.error("Polling failed", e);
            }
        };

        const intervalId = setInterval(pollOrder, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId);
    }, [currentOrderId]);


    const sendOrder = useCallback(async (cartItems: CartItem[], onSuccess: () => void) => {
        if (cartItems.length === 0) return;

        const orderItems: OrderItemRequest[] = cartItems.map((i) => ({
            item_id: i.id,
            quantity: i.quantity,
            option_ids: i.selected_options.map(o => o.id)
        }));

        try {
            if (currentOrderId === null) {
                const payload: any = { items: orderItems };
                if (customerAttributes) {
                    payload.age_group = customerAttributes.ageGroup;
                    payload.gender = customerAttributes.gender;
                }
                const response = await api.post<Order>('/orders', payload);
                setCurrentOrderId(response.data.id);
                setSessionOrders([response.data]);
            } else {
                const response = await api.post<Order>(`/orders/${currentOrderId}/items`, { items: orderItems });
                setSessionOrders([response.data]);
            }
            // alert('厨房へ送信しました！');
            onSuccess();
        } catch (error) {
            console.error('Order failed', error);
            throw error;
        }
    }, [currentOrderId, customerAttributes]);

    const checkout = useCallback(async (paymentMethod: string) => {
        if (currentOrderId === null) {
            console.error("Order ID is missing! Cannot proceed with checkout.");
            return;
        }
        try {
            await api.post(`/orders/${currentOrderId}/checkout`, { payment_method: paymentMethod });

            // alert('お支払い完了です。ありがとうございました！');
            setIsPaymentModalOpen(false);
            setIsThankYouVisible(true);
            // Session clearing is handled by completeSession callback from ThankYouScreen
        } catch (error) {
            console.error('Checkout failed', error);
            throw error;
        }
    }, [currentOrderId]);

    const completeSession = useCallback(() => {
        setIsThankYouVisible(false);
        setCurrentOrderId(null);
        setSessionOrders([]);
        setCustomerAttributes(null);
    }, []);

    const sessionTotal = sessionOrders.reduce((acc, order) =>
        acc + order.items.reduce((sum, item) => {
            const itemPrice = item.item.price;
            const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price_adjustment, 0);
            return sum + (itemPrice + optionsPrice) * item.quantity;
        }, 0), 0);

    return {
        currentOrderId,
        sessionOrders,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isThankYouVisible,
        completeSession,
        sendOrder,
        checkout,
        sessionTotal,
        setCustomerAttributes
    };
};
