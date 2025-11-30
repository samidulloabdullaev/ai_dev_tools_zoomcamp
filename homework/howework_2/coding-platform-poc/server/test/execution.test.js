const request = require('supertest');
const { app, server } = require('../index');

describe('Code Execution API', () => {
    afterAll(() => {
        server.close();
    });

    test('should execute JavaScript code', async () => {
        const res = await request(app)
            .post('/execute')
            .send({
                language: 'javascript',
                code: 'console.log("Hello Test");'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.output).toContain('Hello Test');
    });

    test('should execute Python code', async () => {
        const res = await request(app)
            .post('/execute')
            .send({
                language: 'python',
                code: 'print("Hello Python")'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.output).toContain('Hello Python');
    });

    test('should handle syntax errors', async () => {
        const res = await request(app)
            .post('/execute')
            .send({
                language: 'javascript',
                code: 'console.log("Missing paren"'
            });

        expect(res.statusCode).toEqual(200); // We return 200 with error message in output
        expect(res.body.output).toContain('SyntaxError');
    });

    test('should handle infinite loops (timeout)', async () => {
        const res = await request(app)
            .post('/execute')
            .send({
                language: 'javascript',
                code: 'while(true) {}'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.output).toContain('Execution timed out');
    }, 10000); // Increase test timeout
});
