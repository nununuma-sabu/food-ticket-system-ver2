// import { useAuth } from '../auth/useAuth';

interface Props {
    onStart: () => void;
}

export const StandbyScreen = ({ onStart }: Props) => {
    // const { logout } = useAuth();

    return (
        <div
            onClick={onStart}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 500
            }}
        >
            <h1 style={{ fontSize: '4rem', marginBottom: '2rem', color: '#333', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>食券機システム</h1>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundImage: 'url(https://placehold.co/1920x1080/f0f0f0/333333?text=Delicious+Food)',
                backgroundSize: 'cover',
                opacity: 0.1
            }} />
            <div style={{ zIndex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', color: '#e67e22', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                    画面をタッチして注文を開始してください
                </p>

                {/* 
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        logout();
                    }}
                    style={{
                        marginTop: '2rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#aaa',
                        border: '1px solid #aaa',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    ログアウト
                </button>
                */}
            </div>
            <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};
