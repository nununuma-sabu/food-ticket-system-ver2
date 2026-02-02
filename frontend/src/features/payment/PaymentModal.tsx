import { useState, useEffect } from 'react';

interface Props {
    total: number;
    onConfirm: (method: string) => void;
    onCancel: () => void;
}

type PaymentStep = 'SELECT' | 'ACTION' | 'PROCESSING';

export const PaymentModal = ({ total, onConfirm, onCancel }: Props) => {
    const [method, setMethod] = useState('cash');
    const [step, setStep] = useState<PaymentStep>('SELECT');
    const [progress, setProgress] = useState(0);

    // Reset state when closing/reopening is handled by parent

    useEffect(() => {
        if (step === 'PROCESSING') {
            const timer = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 10;
                    if (next >= 100) {
                        clearInterval(timer);
                        setTimeout(() => onConfirm(method), 500); // Wait a bit then confirm
                        return 100;
                    }
                    return next;
                });
            }, 200);
            return () => clearInterval(timer);
        }
    }, [step, onConfirm, method]);

    const handleActionComplete = () => {
        setStep('PROCESSING');
    };

    const renderSelection = () => (
        <>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>お支払い方法の選択</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
                合計金額: ¥{total.toLocaleString()}
            </p>

            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                {[
                    ['cash', '現金', '💴'],
                    ['credit_card', 'クレジットカード', '💳'],
                    ['e_money', '電子マネー', '📱'],
                    ['qr_code', 'QRコード決済', '🔳']
                ].map(([value, label, icon]) => (
                    <label key={value} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: method === value ? '2px solid #646cff' : '1px solid #e0e0e0',
                        backgroundColor: method === value ? '#f0f0ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <input
                            type="radio"
                            value={value}
                            checked={method === value}
                            onChange={(e) => setMethod(e.target.value)}
                            style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{icon}</span>
                        <span style={{ fontWeight: method === value ? 'bold' : 'normal', fontSize: '1.1rem' }}>{label}</span>
                    </label>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={onCancel} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    color: '#666',
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>キャンセル</button>
                <button onClick={() => setStep('ACTION')} style={{
                    backgroundColor: '#646cff',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    flex: 2,
                    padding: '0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(100, 108, 255, 0.3)'
                }}>次へ</button>
            </div>
        </>
    );

    const renderAction = () => {
        let content;
        switch (method) {
            case 'cash':
                content = (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💴</div>
                        <p style={{ marginBottom: '2rem' }}>自動釣銭機にお金を投入してください</p>
                        <button onClick={handleActionComplete} style={actionButtonStyle}>投入完了 (シミュレート)</button>
                    </div>
                );
                break;
            case 'credit_card':
                content = (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 2s infinite' }}>💳</div>
                        <p style={{ marginBottom: '2rem' }}>端末にカードを差し込んでください</p>
                        <button onClick={handleActionComplete} style={actionButtonStyle}>カード挿入 (シミュレート)</button>
                    </div>
                );
                break;
            case 'e_money':
                content = (
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '200px',
                                height: '200px',
                                margin: '0 auto 2rem',
                                border: '4px dashed #646cff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                backgroundColor: '#f9f9f9'
                            }}
                            onClick={handleActionComplete}
                        >
                            <span style={{ fontSize: '3rem' }}>📱</span>
                            <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>ここをクリックしてタッチ</span>
                        </div>
                        <p>リーダーにスマホ/カードをかざしてください</p>
                    </div>
                );
                break;
            case 'qr_code':
                content = (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', display: 'inline-block', border: '1px solid #ddd' }}>
                            <img src="https://placehold.co/200x200?text=QR+Code" alt="QR Code" style={{ display: 'block' }} />
                        </div>
                        <p style={{ marginBottom: '2rem' }}>カメラでQRコードを読み取ってください</p>
                        <button onClick={handleActionComplete} style={actionButtonStyle}>読み取り完了 (シミュレート)</button>
                    </div>
                );
                break;
        }

        return (
            <>
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>お支払い操作</h2>
                {content}
                <div style={{ marginTop: '2rem' }}>
                    <button onClick={() => setStep('SELECT')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>戻る</button>
                </div>
            </>
        );
    };

    const renderProcessing = () => (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #646cff',
                borderRadius: '50%',
                margin: '0 auto 2rem',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>決済処理中...</h3>
            <p style={{ color: '#666' }}>そのままお待ちください</p>

            <div style={{ width: '100%', backgroundColor: '#eee', height: '10px', borderRadius: '5px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, backgroundColor: '#646cff', height: '100%', transition: 'width 0.2s' }}></div>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '2.5rem',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '450px', // Slightly wider
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                color: '#333'
            }}>
                {step === 'SELECT' && renderSelection()}
                {step === 'ACTION' && renderAction()}
                {step === 'PROCESSING' && renderProcessing()}
            </div>
        </div>
    );
};

const actionButtonStyle: React.CSSProperties = {
    backgroundColor: '#f0ad4e',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    boxShadow: '0 4px 6px rgba(240, 173, 78, 0.3)'
};
