import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange }) => {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="h-full w-full shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
