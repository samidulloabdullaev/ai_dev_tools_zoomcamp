import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

function CodeEditor({ code, language, onChange }) {
    const highlight = (code) => {
        const grammar = language === 'python' ? Prism.languages.python : Prism.languages.javascript;
        return Prism.highlight(code, grammar, language);
    };

    return (
        <div className="code-editor-container">
            <Editor
                value={code}
                onValueChange={onChange}
                highlight={highlight}
                padding={16}
                style={{
                    fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
                    fontSize: 14,
                    lineHeight: 1.6,
                    minHeight: '100%',
                    backgroundColor: '#0d1117',
                    color: '#f0f6fc'
                }}
                textareaId="code-editor"
                className="code-editor"
            />
        </div>
    );
}

export default CodeEditor;
