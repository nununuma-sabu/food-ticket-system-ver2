import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface Props {
    onComplete: (ageGroup: string, gender: string) => void;
}

type Mode = 'SELECTION' | 'CAMERA' | 'SURVEY';

export const FaceAuthScreen = ({ onComplete }: Props) => {
    const [mode, setMode] = useState<Mode>('SELECTION');

    if (mode === 'SELECTION') {
        return (
            <div style={containerStyle}>
                <h1 style={{ marginBottom: '2rem', color: '#333' }}>認証方法を選択してください</h1>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <button onClick={() => setMode('CAMERA')} style={buttonStyle}>
                        📸 顔認証でスムーズに注文
                    </button>
                    <button onClick={() => setMode('SURVEY')} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
                        📝 アンケートに答えて注文
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'CAMERA') {
        return <CameraAuth onComplete={onComplete} onBack={() => setMode('SELECTION')} />;
    }

    if (mode === 'SURVEY') {
        return <SurveyForm onComplete={onComplete} onBack={() => setMode('SELECTION')} />;
    }

    return null;
};

// --- Sub Components ---

const CameraAuth = ({ onComplete, onBack }: { onComplete: Props['onComplete'], onBack: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<string>('AIモデル読み込み中...');
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                await faceapi.nets.ageGenderNet.loadFromUri('/models');
                setIsModelLoaded(true);
                setStatus('カメラに顔を向けてください');
                startVideo();
            } catch (e) {
                console.error(e);
                setStatus('モデル読み込みエラー（リロードしてください）');
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error(err);
                setStatus('カメラ起動エラー: 許可してください');
            });
    };

    const handleVideoPlay = async () => {
        if (!videoRef.current || !isModelLoaded) return;

        const interval = setInterval(async () => {
            if (!videoRef.current) {
                clearInterval(interval);
                return;
            }

            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withAgeAndGender();

            if (detections.length > 0) {
                const detection = detections[0];
                const { age, gender } = detection;

                let ageGroup = 'unknown';
                if (age < 20) ageGroup = '10s';
                else if (age < 30) ageGroup = '20s';
                else if (age < 40) ageGroup = '30s';
                else if (age < 50) ageGroup = '40s';
                else if (age < 60) ageGroup = '50s';
                else ageGroup = '60s_over';

                clearInterval(interval);
                setStatus('認証完了');

                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());

                setTimeout(() => {
                    onComplete(ageGroup, gender);
                }, 1000);
            }
        }, 500);

        return () => clearInterval(interval);
    };

    return (
        <div style={containerStyle}>
            <button onClick={onBack} style={backButtonStyle}>戻る</button>
            <h2 style={{ color: '#333', marginBottom: '1rem' }}>{status}</h2>
            <div style={videoWrapperStyle}>
                <video
                    ref={videoRef}
                    autoPlay
                    onPlay={handleVideoPlay}
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={overlayStyle} />
            </div>
        </div>
    );
};

const SurveyForm = ({ onComplete, onBack }: { onComplete: Props['onComplete'], onBack: () => void }) => {
    const [gender, setGender] = useState('');
    const [ageGroup, setAgeGroup] = useState('');

    const handleSubmit = () => {
        if (gender && ageGroup) {
            onComplete(ageGroup, gender);
        }
    };

    const isReady = gender !== '' && ageGroup !== '';

    return (
        <div style={containerStyle}>
            <button onClick={onBack} style={backButtonStyle}>戻る</button>
            <h2 style={{ color: '#333', marginBottom: '2rem' }}>お客様について教えてください</h2>

            <div style={{ marginBottom: '2rem', width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: '#666', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>性別</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {['male', 'female'].map(g => (
                        <button
                            key={g}
                            onClick={() => setGender(g)}
                            style={{
                                ...optionButtonStyle,
                                backgroundColor: gender === g ? '#646cff' : '#ffffff',
                                color: gender === g ? 'white' : '#333',
                                border: gender === g ? 'none' : '1px solid #ddd',
                                boxShadow: gender === g ? '0 4px 6px rgba(100,108,255,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            {g === 'male' ? '男性' : '女性'}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '2rem', width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: '#666', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>年代</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
                    {['10s', '20s', '30s', '40s', '50s', '60s_over'].map(age => (
                        <button
                            key={age}
                            onClick={() => setAgeGroup(age)}
                            style={{
                                ...optionButtonStyle,
                                backgroundColor: ageGroup === age ? '#646cff' : '#ffffff',
                                color: ageGroup === age ? 'white' : '#333',
                                border: ageGroup === age ? 'none' : '1px solid #ddd',
                                boxShadow: ageGroup === age ? '0 4px 6px rgba(100,108,255,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            {age === '60s_over' ? '60代~' : age}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isReady}
                style={{
                    ...buttonStyle,
                    opacity: isReady ? 1 : 0.5,
                    cursor: isReady ? 'pointer' : 'not-allowed',
                    width: '100%',
                    maxWidth: '400px'
                }}
            >
                注文へ進む
            </button>
        </div>
    );
};

// --- Styles ---

const containerStyle: React.CSSProperties = {
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
    padding: '2rem',
    zIndex: 1000,
    color: '#333'
};

const buttonStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#646cff',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 10px rgba(100, 108, 255, 0.3)'
};

const optionButtonStyle: React.CSSProperties = {
    padding: '1rem',
    fontSize: '1rem',
    color: '#333',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s'
};

const backButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ccc',
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer'
};

const videoWrapperStyle: React.CSSProperties = {
    width: '640px',
    height: '480px',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    marginTop: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
};

const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '300px',
    border: '2px solid rgba(255,255,255,0.8)',
    borderRadius: '50%',
    pointerEvents: 'none',
    boxShadow: '0 0 0 999px rgba(0, 0, 0, 0.3)'
};
