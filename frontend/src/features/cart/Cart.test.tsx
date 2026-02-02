import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Cart, CartItem } from './Cart';

describe('Cart Component', () => {
    const mockOnOrder = vi.fn();
    const mockOnClear = vi.fn();

    const mockItems: CartItem[] = [
        {
            id: 1,
            name: "Ramen",
            price: 1000,
            stock: 10,
            options: [],
            quantity: 2,
            selected_options: []
        },
        {
            id: 2,
            name: "Gyoza",
            price: 500,
            stock: 50,
            options: [],
            quantity: 1,
            selected_options: [
                { id: 101, name: "Extra Garlic", price_adjustment: 50 }
            ]
        }
    ];

    it('renders empty cart message when items are empty', () => {
        render(<Cart items={[]} onOrder={mockOnOrder} onClear={mockOnClear} />);
        expect(screen.getByText('カートは空です')).toBeInTheDocument();
    });

    it('renders cart items and calculates totals correctly', () => {
        // Ramen: 1000 * 2 = 2000
        // Gyoza: (500 + 50) * 1 = 550
        // Total: 2550
        render(<Cart items={mockItems} onOrder={mockOnOrder} onClear={mockOnClear} />);

        expect(screen.getByText(/Ramen x 2/)).toBeInTheDocument();
        expect(screen.getByText(/Gyoza x 1/)).toBeInTheDocument();
        expect(screen.getByText('+ Extra Garlic (+50円)')).toBeInTheDocument();

        // Check formatting carefully. Implementation uses toLocaleString()
        expect(screen.getByText(/合計: ¥2,550/)).toBeInTheDocument();
    });

    it('calls onOrder when order button is clicked', () => {
        render(<Cart items={mockItems} onOrder={mockOnOrder} onClear={mockOnClear} />);
        const button = screen.getByText('注文送信');
        fireEvent.click(button);
        expect(mockOnOrder).toHaveBeenCalledTimes(1);
    });

    it('calls onClear when clear button is clicked', () => {
        render(<Cart items={mockItems} onOrder={mockOnOrder} onClear={mockOnClear} />);
        const button = screen.getByText('クリア');
        fireEvent.click(button);
        expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
});
