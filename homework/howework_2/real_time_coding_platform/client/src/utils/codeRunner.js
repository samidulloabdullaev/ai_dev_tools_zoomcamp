// Pyodide instance cached for reuse
let pyodideInstance = null;
let pyodideLoading = false;

// Load Pyodide for Python execution
async function loadPyodideIfNeeded() {
    if (pyodideInstance) {
        return pyodideInstance;
    }

    if (pyodideLoading) {
        // Wait for the existing load to complete
        while (pyodideLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pyodideInstance;
    }

    pyodideLoading = true;

    try {
        // Load Pyodide from CDN
        if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        pyodideLoading = false;
        return pyodideInstance;
    } catch (error) {
        pyodideLoading = false;
        throw error;
    }
}

// Run Python code using Pyodide
async function runPython(code) {
    try {
        const pyodide = await loadPyodideIfNeeded();

        // Redirect stdout to capture print statements
        pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);

        // Run the user's code
        await pyodide.runPythonAsync(code);

        // Get the output
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');

        // Reset stdout/stderr
        pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

        if (stderr) {
            return { error: stderr };
        }

        return { output: stdout };
    } catch (error) {
        return { error: error.message };
    }
}

// Run JavaScript code using a safe evaluation method
async function runJavaScript(code) {
    return new Promise((resolve) => {
        try {
            // Capture console.log output
            const logs = [];
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;

            console.log = (...args) => {
                logs.push(args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '));
            };
            console.error = (...args) => {
                logs.push(`[Error] ${args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')}`);
            };
            console.warn = (...args) => {
                logs.push(`[Warning] ${args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')}`);
            };

            // Use Function constructor for slightly safer evaluation
            // Note: This is not fully sandboxed but is safer than direct eval
            const fn = new Function(code);
            const result = fn();

            // Restore console methods
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;

            // If the code returns a value that wasn't logged, add it
            if (result !== undefined && logs.length === 0) {
                logs.push(String(result));
            }

            resolve({ output: logs.join('\n') });
        } catch (error) {
            resolve({ error: error.message });
        }
    });
}

// Main function to run code in the appropriate runtime
export async function runCode(code, language) {
    if (language === 'python') {
        return runPython(code);
    } else if (language === 'javascript') {
        return runJavaScript(code);
    } else {
        return { error: `Unsupported language: ${language}` };
    }
}
