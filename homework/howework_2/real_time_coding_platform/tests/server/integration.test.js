const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { app, server } = require('../../server/index');

describe('API Integration Tests', () => {

    describe('Health Endpoint', () => {
        it('GET /api/health should return 200 OK', async () => {
            const response = await request(app).get('/api/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
        });
    });

    describe('Room Management', () => {
        it('POST /api/rooms should create a new room and return 200', async () => {
            const response = await request(app).post('/api/rooms');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('roomId');
            expect(typeof response.body.roomId).toBe('string');
        });

        it('GET /api/rooms/:roomId should return room info', async () => {
            // First create a room
            const createResponse = await request(app).post('/api/rooms');
            const { roomId } = createResponse.body;

            // Then get the room
            const response = await request(app).get(`/api/rooms/${roomId}`);
            expect(response.status).toBe(200);
            expect(response.body.exists).toBe(true);
            expect(response.body.room).toHaveProperty('id', roomId);
        });

        it('GET /api/rooms/:roomId should auto-create room if not exists', async () => {
            const response = await request(app).get('/api/rooms/test-room-123');
            expect(response.status).toBe(200);
            expect(response.body.exists).toBe(true);
        });
    });
});

describe('Socket.IO Integration Tests', () => {
    let io, clientSocket, httpServer;
    let port;

    beforeAll((done) => {
        httpServer = createServer();
        io = new Server(httpServer);

        io.on('connection', (socket) => {
            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                socket.emit('room-state', { code: '', language: 'javascript', userCount: 1 });
            });

            socket.on('code-change', ({ roomId, code }) => {
                socket.to(roomId).emit('code-update', { code });
            });
        });

        httpServer.listen(0, () => {
            port = httpServer.address().port;
            done();
        });
    });

    afterAll((done) => {
        if (clientSocket) clientSocket.close();
        io.close();
        httpServer.close(done);
    });

    it('should connect to Socket.IO server', (done) => {
        clientSocket = Client(`http://localhost:${port}`);

        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            done();
        });

        clientSocket.on('connect_error', (err) => {
            done(err);
        });
    });

    it('should join a room and receive room state', (done) => {
        if (!clientSocket || !clientSocket.connected) {
            clientSocket = Client(`http://localhost:${port}`);
        }

        clientSocket.on('room-state', (state) => {
            expect(state).toHaveProperty('code');
            expect(state).toHaveProperty('language');
            expect(state).toHaveProperty('userCount');
            done();
        });

        clientSocket.emit('join-room', 'test-room');
    });
});
