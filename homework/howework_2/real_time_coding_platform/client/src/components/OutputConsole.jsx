function OutputConsole({ output, isLoading }) {
    return (
        <div className="output-content">
            {isLoading && (
                <div className="output-line info">
                    ⏳ Loading Python environment (Pyodide)... This may take a moment.
                </div>
            )}
            {output.length === 0 && !isLoading ? (
                <div className="output-placeholder">
                    Output will appear here when you run your code...
                </div>
            ) : (
                output.map((line, index) => (
                    <div key={index} className={`output-line ${line.type}`}>
                        {line.timestamp && <span className="timestamp">[{line.timestamp}]</span>}
                        <span className="line-text">{line.text}</span>
                    </div>
                ))
            )}
        </div>
    );
}

export default OutputConsole;
