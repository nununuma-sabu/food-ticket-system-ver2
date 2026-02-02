import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOrderSession } from './useOrderSession';
import api from '../../api';
import type { CartItem } from '../cart/Cart';

// Mock API module
vi.mock('../../api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('useOrderSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup timer mocks for polling test if needed
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useOrderSession());
        expect(result.current.currentOrderId).toBeNull();
        expect(result.current.sessionOrders).toEqual([]);
        expect(result.current.sessionTotal).toBe(0);
    });

    it('sends order successfully (new order)', async () => {
        const mockCartItems: CartItem[] = [{
            id: 1, name: 'Item1', price: 100, stock: 10, options: [], quantity: 2, selected_options: []
        }];
        const mockOrderResponse = { data: { id: 123, status: 'pending', items: [] } };
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrderResponse);

        const { result } = renderHook(() => useOrderSession());
        const mockOnSuccess = vi.fn();

        await act(async () => {
            await result.current.sendOrder(mockCartItems, mockOnSuccess);
        });

        expect(api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
            items: [{ item_id: 1, quantity: 2, option_ids: [] }]
        }));
        expect(result.current.currentOrderId).toBe(123);
        expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Add more tests for existing order (add items), checkout, and polling
    it('polls for status updates when currentOrderId is set', async () => {
        const mockOrderResponse = { data: { id: 123, status: 'completed', items: [] } };
        (api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrderResponse);

        const { result } = renderHook(() => useOrderSession());

        // Manually set order ID logic is internal (done via sendOrder usually).
        // Since we can't easily set state from outside without exposing a setter (which hook doesn't do directly for id),
        // we simulate flow or just trust integration.
        // But wait, the hook exposes currentOrderId result, but no setter. 
        // We need to trigger sendOrder to set it.

        const mockCartItems: CartItem[] = [{
            id: 1, name: 'Item1', price: 100, stock: 10, options: [], quantity: 1, selected_options: []
        }];
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 123, status: 'pending', items: [] } });

        await act(async () => {
            await result.current.sendOrder(mockCartItems, () => { });
        });

        expect(result.current.currentOrderId).toBe(123);

        // Now advance time to trigger polling
        await act(async () => {
            vi.advanceTimersByTime(5000);
        });

        expect(api.get).toHaveBeenCalledWith('/orders/123');
    });

    it('calculates sessionTotal correctly', async () => {
        const mockOrderResponse = {
            data: {
                id: 123,
                status: 'pending',
                items: [
                    { item: { price: 100 }, quantity: 2, options: [] },
                    { item: { price: 200 }, quantity: 1, options: [{ price_adjustment: 50 }] }
                ]
            }
        };
        (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrderResponse);

        const { result } = renderHook(() => useOrderSession());

        await act(async () => {
            await result.current.sendOrder([{ id: 1, quantity: 2, selected_options: [] } as any], () => { });
        });

        // 100 * 2 = 200
        // (200 + 50) * 1 = 250
        // Total = 450
        expect(result.current.sessionTotal).toBe(450);
    });
});
