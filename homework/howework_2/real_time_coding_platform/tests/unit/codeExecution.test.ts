import { describe, it, expect } from 'vitest';
import { executeCode } from '@/lib/codeExecution';

describe('codeExecution', () => {
  describe('executeCode', () => {
    it('should execute JavaScript code and return output', async () => {
      const result = await executeCode('console.log("Hello World")', 'javascript');
      expect(result.output).toBe('Hello World');
      expect(result.error).toBeUndefined();
    });

    it('should handle JavaScript errors', async () => {
      const result = await executeCode('throw new Error("Test error")', 'javascript');
      expect(result.error).toContain('Test error');
    });

    it('should execute TypeScript code (transpiled to JS)', async () => {
      const result = await executeCode('const x: number = 5; console.log(x)', 'typescript');
      expect(result.output).toBe('5');
    });

    it('should return error for non-executable languages', async () => {
      const result = await executeCode('print("Hello")', 'python');
      expect(result.error).toContain('cannot be executed');
    });

    it('should handle multiple console.log outputs', async () => {
      const result = await executeCode('console.log("a"); console.log("b")', 'javascript');
      expect(result.output).toContain('a');
      expect(result.output).toContain('b');
    });

    it('should handle syntax errors', async () => {
      const result = await executeCode('const x = {', 'javascript');
      expect(result.error).toBeDefined();
    });
  });
});
