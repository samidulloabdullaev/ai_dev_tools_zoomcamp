import { describe, it, expect, vi } from 'vitest';
import { runCode } from '../../client/src/utils/codeRunner';

describe('Client Logic (codeRunner)', () => {
    it('should run JavaScript code correctly', async () => {
        const code = 'return 42;';
        const result = await runCode(code, 'javascript');
        // runJavaScript captures console logs or returns result if not logged
        expect(result).toHaveProperty('output');
        expect(result.output).toBe('42');
    });

    it('should capture console.log in JavaScript', async () => {
        const code = 'console.log("Hello World");';
        const result = await runCode(code, 'javascript');
        expect(result.output).toBe('Hello World');
    });

    it('should handle errors in JavaScript', async () => {
        const code = 'throw new Error("Test Error");';
        const result = await runCode(code, 'javascript');
        // The implementation captures error message
        expect(result.error).toBe('Test Error');
    });

    it('should return error for unsupported language (unless mocked)', async () => {
        const result = await runCode('print("hello")', 'ruby');
        expect(result.error).toContain('Unsupported language');
    });
});
