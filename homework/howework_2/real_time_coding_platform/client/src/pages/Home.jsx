import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Home() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState('');

    const createRoom = async () => {
        try {
            const response = await fetch(`${API_URL}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            navigate(`/room/${data.roomId}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            // Fallback: generate a random room ID client-side
            const randomId = Math.random().toString(36).substring(2, 10);
            navigate(`/room/${randomId}`);
        }
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId.trim()) {
            setError('Please enter a Room ID or URL');
            return;
        }

        // Extract Room ID if a URL is pasted
        let targetRoomId = roomId.trim();
        try {
            if (targetRoomId.includes('/room/')) {
                const url = new URL(targetRoomId);
                const parts = url.pathname.split('/');
                const idIndex = parts.indexOf('room') + 1;
                if (idIndex > 0 && idIndex < parts.length) {
                    targetRoomId = parts[idIndex];
                }
            }
        } catch (e) {
            // Not a valid URL, treat as ID
        }

        navigate(`/room/${targetRoomId}`);
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">CodeSync</h1>
                <p className="home-subtitle">
                    Real-time collaborative code editor for technical interviews.
                    Share code, run it in the browser, and collaborate seamlessly.
                </p>

                <div className="action-container">
                    <button className="create-room-btn" onClick={createRoom}>
                        <span className="btn-icon">🚀</span> Create New Interview
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <form onSubmit={joinRoom} className="join-room-form">
                        <input
                            type="text"
                            className="room-input"
                            placeholder="Enter Room ID or Paste Link"
                            value={roomId}
                            onChange={(e) => {
                                setRoomId(e.target.value);
                                setError('');
                            }}
                        />
                        <button type="submit" className="join-btn">
                            Join Room
                        </button>
                    </form>
                    {error && <p className="error-msg">{error}</p>}
                </div>

                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">⚡</div>
                        <div className="feature-title">Real-time Sync</div>
                        <div className="feature-desc">Code changes sync instantly across all users</div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🎨</div>
                        <div className="feature-title">Syntax Highlighting</div>
                        <div className="feature-desc">JavaScript and Python support with beautiful highlighting</div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔒</div>
                        <div className="feature-title">Safe Execution</div>
                        <div className="feature-desc">Run code securely in-browser with WebAssembly</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
