import React, { useState } from 'react';
import type { Item, Option } from '../../types';

interface Props {
    item: Item;
    onConfirm: (selectedOptions: Option[]) => void;
    onCancel: () => void;
}

export const ItemOptionModal = ({ item, onConfirm, onCancel }: Props) => {
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

    const handleOptionToggle = (option: Option) => {
        const exists = selectedOptions.find(o => o.id === option.id);
        if (exists) {
            setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalStyle}>
                <h3>{item.name} - オプション選択</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    お好きなオプションを追加できます（複数選択可）
                </p>
                <div style={{ margin: '1rem 0', maxHeight: '300px', overflowY: 'auto' }}>
                    {item.options.map((option) => (
                        <div key={option.id} style={optionItemStyle}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                                <input
                                    type="checkbox"
                                    checked={!!selectedOptions.find(o => o.id === option.id)}
                                    onChange={() => handleOptionToggle(option)}
                                    style={{ marginRight: '0.8rem', transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                <span>
                                    {option.name}
                                    <span style={{
                                        marginLeft: '0.5rem',
                                        color: option.price_adjustment > 0 ? '#ff4d4f' : '#52c41a',
                                        fontWeight: 'bold'
                                    }}>
                                        ({option.price_adjustment > 0 ? '+' : ''}{option.price_adjustment.toLocaleString()}円)
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={onCancel} style={cancelButtonStyle}>キャンセル</button>
                    <button onClick={() => onConfirm(selectedOptions)} style={confirmButtonStyle}>決定</button>
                </div>
            </div>
        </div>
    );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(4px)'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    color: '#333',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

const optionItemStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.1s'
};

const cancelButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    color: '#666',
    padding: '0.6rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem'
};

const confirmButtonStyle: React.CSSProperties = {
    backgroundColor: '#646cff',
    border: 'none',
    color: 'white',
    padding: '0.6rem 2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    boxShadow: '0 4px 6px rgba(100, 108, 255, 0.2)'
};
