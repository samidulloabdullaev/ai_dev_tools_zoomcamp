import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CodeEditor from './components/CodeEditor';

const socket = io('http://localhost:3001'); // Connect to backend

const languageTemplates = {
    javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
    python: '# Write your Python code here\nprint("Hello, World!")',
    cpp: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
};

function App() {
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [code, setCode] = useState(languageTemplates.javascript);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('code-change', (newCode) => {
            setCode(newCode);
        });

        return () => {
            socket.off('connect');
            socket.off('code-change');
        };
    }, []);

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        setCode(languageTemplates[newLanguage]);
    };

    const joinRoom = () => {
        if (roomId) {
            socket.emit('join-room', roomId);
            setJoined(true);
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (joined) {
            socket.emit('code-change', { roomId, code: newCode });
        }
    };

    const runCode = async () => {
        setOutput(`Running ${language} code...`);
        try {
            const response = await fetch('http://localhost:3001/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language }),
            });
            const data = await response.json();
            if (data.error) {
                setOutput(`Error: ${data.error}`);
            } else {
                setOutput(data.output || 'No output');
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    if (!joined) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
                    <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Code Interview</h1>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <button
                            onClick={joinRoom}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-blue-400">Room: {roomId}</h1>
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </div>
                <button
                    onClick={runCode}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-200 flex items-center"
                >
                    <span className="mr-2">▶</span> Run Code
                </button>
            </header>

            <main className="flex-1 flex p-4 space-x-4 overflow-hidden">
                <div className="flex-1 flex flex-col">
                    <CodeEditor code={code} language={language} onChange={handleCodeChange} />
                </div>
                <div className="w-1/3 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
                    <div className="p-3 border-b border-gray-700 font-semibold bg-gray-750">Output</div>
                    <div className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-300 flex-1 overflow-auto">
                        {output || 'Click "Run Code" to see output.'}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
