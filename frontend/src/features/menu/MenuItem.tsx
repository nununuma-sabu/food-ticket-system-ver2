import { useState } from 'react';
import type { Item, Option } from '../../types';
import { ItemOptionModal } from './ItemOptionModal';

interface Props {
    item: Item;
    onAdd: (item: Item, selectedOptions?: Option[]) => void;
}

export const MenuItem = ({ item, onAdd }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        if (item.options && item.options.length > 0) {
            setIsModalOpen(true);
        } else {
            onAdd(item, []);
        }
    };

    const handleConfirm = (selectedOptions: Option[]) => {
        onAdd(item, selectedOptions);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="menu-item">
                {item.image_url && <img src={item.image_url} alt={item.name} />}
                <div style={{ padding: '1rem' }}>
                    <h3>{item.name}</h3>
                    <p>¥{item.price.toLocaleString()}</p>
                    {item.options && item.options.length > 0 && (
                        <p style={{ fontSize: '0.8rem', color: '#646cff', fontWeight: 'bold' }}>
                            オプションあり
                        </p>
                    )}
                    <button onClick={handleAddClick}>追加</button>
                </div>
            </div>

            {isModalOpen && (
                <ItemOptionModal
                    item={item}
                    onConfirm={handleConfirm}
                    onCancel={() => setIsModalOpen(false)}
                />
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

