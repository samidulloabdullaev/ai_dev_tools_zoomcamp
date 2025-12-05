import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeEditor from '../components/CodeEditor';
import OutputConsole from '../components/OutputConsole';
import { runCode } from '../utils/codeRunner';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

function Room() {
    const { roomId } = useParams();
    const [socket, setSocket] = useState(null);
    const [code, setCode] = useState('// Welcome to CodeSync!\n// Start coding here...\n\nconsole.log("Hello, World!");');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userCount, setUserCount] = useState(1);
    const [pyodideLoading, setPyodideLoading] = useState(false);

    // Connect to Socket.IO server
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            newSocket.emit('join-room', roomId);
        });

        newSocket.on('room-state', (state) => {
            if (state.code) setCode(state.code);
            if (state.language) setLanguage(state.language);
            setUserCount(state.userCount || 1);
            setIsLoading(false);
        });

        newSocket.on('code-update', ({ code: newCode }) => {
            setCode(newCode);
        });

        newSocket.on('language-update', ({ language: newLang }) => {
            setLanguage(newLang);
        });

        newSocket.on('user-joined', ({ userCount: count }) => {
            setUserCount(count);
            setOutput(prev => [...prev, { type: 'info', text: '👋 A new user joined the room!' }]);
        });

        newSocket.on('user-left', ({ userCount: count }) => {
            setUserCount(count);
            setOutput(prev => [...prev, { type: 'info', text: '👋 A user left the room.' }]);
        });

        newSocket.on('console-output', ({ output: remoteOutput }) => {
            setOutput(prev => [...prev, ...remoteOutput]);
        });

        newSocket.on('connect_error', () => {
            console.log('Connection error, retrying...');
            setIsLoading(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [roomId]);

    const handleCodeChange = useCallback((newCode) => {
        setCode(newCode);
        if (socket) {
            socket.emit('code-change', { roomId, code: newCode });
        }
    }, [socket, roomId]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);

        // Set default code for the language
        if (newLang === 'python' && !code.includes('print')) {
            setCode('# Welcome to CodeSync!\n# Start coding here...\n\nprint("Hello, World!")');
        } else if (newLang === 'javascript' && !code.includes('console.log')) {
            setCode('// Welcome to CodeSync!\n// Start coding here...\n\nconsole.log("Hello, World!");');
        }

        if (socket) {
            socket.emit('language-change', { roomId, language: newLang });
        }
    };

    const getTimestamp = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        const timestamp = getTimestamp();
        const startMsg = { type: 'info', text: `\n--- Output from ${language} execution ---`, timestamp };
        const runMsg = { type: 'info', text: `▶ Running ${language}...`, timestamp };

        // Append to local state instead of resetting
        const newLog = [startMsg, runMsg];
        setOutput(prev => [...prev, ...newLog]);

        // Broadcast start message
        if (socket) {
            socket.emit('console-output', { roomId, output: newLog });
        }

        try {
            if (language === 'python') {
                setPyodideLoading(true);
            }

            const result = await runCode(code, language);

            setPyodideLoading(false);

            let newOutput = [];
            const resultTimestamp = getTimestamp();
            if (result.error) {
                newOutput = [{ type: 'error', text: result.error, timestamp: resultTimestamp }];
            } else {
                const outputLines = result.output.split('\n').filter(line => line.trim());
                if (outputLines.length === 0) {
                    newOutput = [{ type: 'success', text: '✓ Code executed successfully (no output)', timestamp: resultTimestamp }];
                } else {
                    newOutput = [
                        ...outputLines.map(line => ({ type: 'default', text: line, timestamp: resultTimestamp })),
                        { type: 'success', text: '✓ Execution completed', timestamp: resultTimestamp }
                    ];
                }
            }

            setOutput(prev => [...prev, ...newOutput]);
            if (socket) {
                socket.emit('console-output', { roomId, output: newOutput });
            }

        } catch (error) {
            setPyodideLoading(false);
            const errorMsg = { type: 'error', text: `Error: ${error.message}`, timestamp: getTimestamp() };
            setOutput(prev => [...prev, errorMsg]);
            if (socket) {
                socket.emit('console-output', { roomId, output: [errorMsg] });
            }
        }

        setIsRunning(false);
    };

    const clearOutput = () => {
        setOutput([]);
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setOutput(prev => [...prev, { type: 'info', text: '📋 Room link copied to clipboard!' }]);
    };

    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <div className="loading-text">Connecting to room...</div>
            </div>
        );
    }

    return (
        <div className="room-container">
            <header className="room-header">
                <h1 className="room-title">CodeSync</h1>
                <div className="room-info">
                    <div className="user-count">
                        <span>👥</span>
                        <span>{userCount} user{userCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="room-id" onClick={copyRoomLink} style={{ cursor: 'pointer' }} title="Click to copy link">
                        Room: {roomId.substring(0, 8)}...
                    </div>
                </div>
            </header>

            <main className="room-main">
                <section className="editor-section">
                    <div className="editor-toolbar">
                        <select
                            className="language-select"
                            value={language}
                            onChange={handleLanguageChange}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                        <button
                            className="run-btn"
                            onClick={handleRunCode}
                            disabled={isRunning}
                        >
                            {isRunning ? '⏳ Running...' : '▶ Run Code'}
                        </button>
                    </div>
                    <div className="editor-wrapper">
                        <CodeEditor
                            code={code}
                            language={language}
                            onChange={handleCodeChange}
                        />
                    </div>
                </section>

                <section className="output-section">
                    <div className="output-header">
                        <span className="output-title">Console Output</span>
                        <button className="clear-btn" onClick={clearOutput}>Clear</button>
                    </div>
                    <OutputConsole output={output} isLoading={pyodideLoading} />
                </section>
            </main>
        </div>
    );
}

export default Room;
