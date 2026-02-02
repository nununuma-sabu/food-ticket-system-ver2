import { useState } from 'react';
import type { Item, Option } from '../../types';

interface Props {
    item: Item;
    onAdd: (item: Item, selectedOptions?: Option[]) => void;
}

export const MenuItem = ({ item, onAdd }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

    const handleAddClick = () => {
        if (item.options && item.options.length > 0) {
            setSelectedOptions([]);
            setIsModalOpen(true);
        } else {
            onAdd(item, []);
        }
    };

    const handleConfirm = () => {
        onAdd(item, selectedOptions);
        setIsModalOpen(false);
    };

    const handleOptionSelect = (option: Option | null) => {
        // If already selected, deselect it (allow no option)
        if (option === null) {
            setSelectedOptions([]);
        } else if (selectedOptions.find(o => o.id === option.id)) {
            setSelectedOptions([]);
        } else {
            // Select only this option (exclusive)
            setSelectedOptions([option]);
        }
    };

    return (
        <>
            <div className="menu-item">
                {item.image_url && <img src={item.image_url} alt={item.name} />}
                <div style={{ padding: '1rem' }}>
                    <h3>{item.name}</h3>
                    <p>¥{item.price.toLocaleString()}</p>
                    {item.options && item.options.length > 0 && (
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>オプションあり</p>
                    )}
                    <button onClick={handleAddClick}>追加</button>
                </div>
            </div>

            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <h3>{item.name} - オプション選択</h3>
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>※オプションは1つだけ選択可能です</p>
                        <div style={{ margin: '1rem 0', maxHeight: '300px', overflowY: 'auto' }}>
                            <div style={optionItemStyle}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                                    <input
                                        type="radio"
                                        name="item-option"
                                        checked={selectedOptions.length === 0}
                                        onChange={() => handleOptionSelect(null)}
                                        style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                                    />
                                    <span>選択なし</span>
                                </label>
                            </div>
                            {item.options.map((option) => (
                                <div key={option.id} style={optionItemStyle}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                                        <input
                                            type="radio"
                                            name="item-option"
                                            checked={!!selectedOptions.find(o => o.id === option.id)}
                                            onChange={() => handleOptionSelect(option)}
                                            style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
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
                            <button onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>キャンセル</button>
                            <button onClick={handleConfirm} style={confirmButtonStyle}>決定</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

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
    padding: '0.8rem',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const cancelButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    color: '#666',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

const confirmButtonStyle: React.CSSProperties = {
    backgroundColor: '#646cff',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(100, 108, 255, 0.2)'
};
