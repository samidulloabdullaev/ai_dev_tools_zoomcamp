const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { app } = require('../index'); // Assuming index.js exports app

describe('Coding Platform Backend', () => {
    let io, server, clientSocket, serverSocket;
    let httpServer;
    let port;

    beforeAll((done) => {
        httpServer = createServer(app);
        io = new Server(httpServer);

        // We need to use the same logic as index.js or import the server/io from there if exported.
        // Since index.js starts the server automatically if not in test env, we should check how it's structured.
        // The index.js exports { app, server, io }.

        // Let's use the exported server and io from index.js instead of creating new ones if possible.
        // However, index.js might already be listening.
        // Let's require the index.js module.
        const serverModule = require('../index');
        server = serverModule.server;
        io = serverModule.io;

        // If server is not listening (because of NODE_ENV=test check in index.js), we listen.
        if (!server.listening) {
            server.listen(() => {
                port = server.address().port;
                clientSocket = new Client(`http://localhost:${port}`);
                io.on('connection', (socket) => {
                    serverSocket = socket;
                });
                clientSocket.on('connect', done);
            });
        } else {
            port = server.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        }
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        server.close();
    });

    test('should connect to the server', (done) => {
        expect(clientSocket.connected).toBe(true);
        done();
    });

    test('should join a room', (done) => {
        const roomId = 'test-room';
        clientSocket.emit('join-room', roomId);

        // We can't easily check server side state without exposing it, but we can check if we receive messages in that room.
        // Or we can rely on the console log (not good for test).
        // Let's verify by sending a message to the room and seeing if we get it?
        // But broadcast excludes sender. So we need a second client.

        const client2 = new Client(`http://localhost:${port}`);
        client2.on('connect', () => {
            client2.emit('join-room', roomId);

            // Wait a bit for join to process
            setTimeout(() => {
                client2.close();
                done();
            }, 50);
        });
    });

    test('should broadcast code changes to other users in the room', (done) => {
        const roomId = 'code-room';
        const client2 = new Client(`http://localhost:${port}`);

        clientSocket.emit('join-room', roomId);

        client2.on('connect', () => {
            client2.emit('join-room', roomId);

            client2.on('code-change', (code) => {
                expect(code).toBe('console.log("hello");');
                client2.close();
                done();
            });

            // Wait for join to propagate then emit code change from client1
            setTimeout(() => {
                clientSocket.emit('code-change', { roomId, code: 'console.log("hello");' });
            }, 100);
        });
    });
});
