import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { ItemManager } from './ItemManager';
import api from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    }
}));

describe('ItemManager Component', () => {
    it('fetches and displays items', async () => {
        // Mock data
        const mockItems = [
            { id: 1, name: '醤油ラーメン', price: 780, category: '麺類', stock: 50, image_url: '' },
            { id: 2, name: '餃子', price: 350, category: 'サイドメニュー', stock: 100, image_url: '' }
        ];

        // Setup mock response
        (api.get as any).mockResolvedValue({ data: mockItems });

        render(<ItemManager />);

        // Verify title
        expect(screen.getByText('商品管理')).toBeInTheDocument();

        // Verify items are rendered (wait for effect)
        await waitFor(() => {
            expect(screen.getByText('醤油ラーメン')).toBeInTheDocument();
            expect(screen.getByText('餃子')).toBeInTheDocument();
        });

        // Verify prices
        expect(screen.getByText('¥780')).toBeInTheDocument();
        expect(screen.getByText('¥350')).toBeInTheDocument();
    });
});
