import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { KioskApp } from './KioskApp';
import api from './api';
import * as useAuthModule from './features/auth/useAuth';

// Mocks
vi.mock('./api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        defaults: { headers: { common: {} } }
    }
}));

// Mock FaceAuthScreen because it loads heavy libraries
vi.mock('./features/auth/FaceAuthScreen', () => ({
    FaceAuthScreen: ({ onComplete }: { onComplete: () => void }) => (
        <button data-testid="face-auth-complete" onClick={() => onComplete()}>
            FaceAuth Complete
        </button>
    )
}));

describe('Kiosk App Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Auth
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            token: 'mock-token'
        });
    });

    it('completes the full order flow with options', async () => {
        // 1. Setup API Response
        const mockItems = [
            {
                id: 1,
                name: '醤油ラーメン',
                price: 780,
                category: '麺類',
                stock: 50,
                options: [
                    { id: 101, name: '大盛り', price_adjustment: 100 },
                    { id: 102, name: '味玉', price_adjustment: 100 }
                ]
            }
        ];
        (api.get as any).mockResolvedValue({ data: mockItems });
        (api.post as any).mockResolvedValue({
            data: {
                id: 123,
                items: [
                    {
                        item: { name: '醤油ラーメン' },
                        quantity: 1,
                        options: [{ id: 101, name: '大盛り', price_adjustment: 100 }]
                    }
                ]
            }
        }); // For order submission

        render(<KioskApp />);

        // 2. Check Standby -> FaceAuth -> Ordering
        await waitFor(() => expect(screen.getByText('画面をタッチして注文を開始してください')).toBeInTheDocument());
        fireEvent.click(screen.getByText('画面をタッチして注文を開始してください')); // Standby -> FaceAuth

        await waitFor(() => expect(screen.getByTestId('face-auth-complete')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('face-auth-complete')); // FaceAuth -> Ordering

        // 3. Ordering Screen
        await waitFor(() => expect(screen.getByText('醤油ラーメン')).toBeInTheDocument());

        // 4. Open Option Modal
        fireEvent.click(screen.getByText('追加'));
        await waitFor(() => expect(screen.getByText('醤油ラーメン - オプション選択')).toBeInTheDocument());

        // 5. Select "Large" (+100)
        const largeOption = screen.getByLabelText((content, element) => {
            return element?.tagName.toLowerCase() === 'input' &&
                element.parentElement?.textContent?.includes('大盛り');
        });
        fireEvent.click(largeOption);

        // 6. Confirm Option
        fireEvent.click(screen.getByText('決定'));
        expect(screen.queryByText('オプション選択')).not.toBeInTheDocument();

        // 7. Check Cart
        // Item price 780 + Option 100 = 880
        expect(screen.getByText('¥880')).toBeInTheDocument();

        // 8. Place Order
        fireEvent.click(screen.getByText('注文送信'));
        await waitFor(() => expect(screen.getByText('厨房へ送信しました！')).toBeInTheDocument());

        // 9. Checkout
        fireEvent.click(screen.getByText('お会計に進む'));
        await waitFor(() => expect(screen.getByText('お支払い方法の選択')).toBeInTheDocument());

        fireEvent.click(screen.getByText('現金'));
        fireEvent.click(screen.getByText('次へ'));

        // Action Screen (Cash)
        await waitFor(() => expect(screen.getByText('投入完了 (シミュレート)')).toBeInTheDocument());

        // Proceed to Processing
        vi.useFakeTimers();
        fireEvent.click(screen.getByText('投入完了 (シミュレート)'));

        // Fast-forward processing animation (approx 2.5s)
        vi.advanceTimersByTime(3000);
        vi.useRealTimers();

        // 10. Verify Ticket Screen
        await waitFor(() => expect(screen.getByText('ご購入ありがとうございます')).toBeInTheDocument());
        expect(screen.getByText('123')).toBeInTheDocument(); // Call Number (from mock order id 123)

        // Check ticket content
        expect(screen.getByText(/醤油ラーメン/)).toBeInTheDocument();
        expect(screen.getByText(/大盛り/)).toBeInTheDocument();
    });
});
