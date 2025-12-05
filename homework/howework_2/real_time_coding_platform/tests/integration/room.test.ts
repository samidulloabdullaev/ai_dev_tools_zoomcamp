import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { io as ioClient, Socket } from 'socket.io-client';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AddressInfo } from 'net';

describe('Room Management Integration Tests', () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: SocketIOServer;
    let serverSocket: any;
    let clientSocket: Socket;
    let port: number;

    beforeAll((done) => {
        httpServer = createServer();
        io = new SocketIOServer(httpServer, {
            cors: {
                origin: '*',
            },
        });

        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            done();
        });
    });

    afterAll(() => {
        io.close();
        httpServer.close();
    });

    it('should create a room and allow participants to join', (done) => {
        const roomData = {
            hostName: 'Test Host',
            title: 'Test Interview',
        };

        // Setup server-side event handlers
        io.on('connection', (socket) => {
            serverSocket = socket;

            socket.on('room:create', (data, callback) => {
                expect(data.hostName).toBe(roomData.hostName);
                expect(data.title).toBe(roomData.title);

                const roomId = 'test-room-123';
                callback(roomId);

                socket.emit('room:updated', {
                    id: roomId,
                    title: data.title,
                    participants: [{ name: data.hostName, isHost: true }],
                });
            });
        });

        // Setup client
        clientSocket = ioClient(`http://localhost:${port}`);

        clientSocket.on('connect', () => {
            clientSocket.emit('room:create', roomData, (roomId: string) => {
                expect(roomId).toBe('test-room-123');
            });
        });

        clientSocket.on('room:updated', (room: any) => {
            expect(room.id).toBe('test-room-123');
            expect(room.participants).toHaveLength(1);
            clientSocket.close();
            done();
        });
    });

    it('should synchronize code updates across clients', (done) => {
        const testCode = 'console.log("Hello World");';
        let client1: Socket;
        let client2: Socket;
        let updatesReceived = 0;

        io.on('connection', (socket) => {
            socket.on('code:update', (code) => {
                // Broadcast to all clients except sender
                socket.broadcast.emit('room:updated', {
                    code,
                });
            });
        });

        client1 = ioClient(`http://localhost:${port}`);
        client2 = ioClient(`http://localhost:${port}`);

        let bothConnected = 0;
        const checkBothConnected = () => {
            bothConnected++;
            if (bothConnected === 2) {
                // Send code update from client1
                client1.emit('code:update', testCode);
            }
        };

        client1.on('connect', checkBothConnected);
        client2.on('connect', checkBothConnected);

        // Client2 should receive the update
        client2.on('room:updated', (data: any) => {
            expect(data.code).toBe(testCode);
            updatesReceived++;

            if (updatesReceived === 1) {
                client1.close();
                client2.close();
                done();
            }
        });
    });

    it('should handle participant disconnect', (done) => {
        let disconnectedParticipantId: string | null = null;

        io.on('connection', (socket) => {
            const participantId = socket.id;

            socket.on('disconnect', () => {
                disconnectedParticipantId = participantId;
                io.emit('participant:left', participantId);
            });
        });

        const client = ioClient(`http://localhost:${port}`);
        let clientId: string;

        client.on('connect', () => {
            clientId = client.id;
            // Disconnect after a short delay
            setTimeout(() => {
                client.close();
            }, 100);
        });

        io.on('participant:left', (participantId: string) => {
            expect(participantId).toBe(clientId);
            expect(disconnectedParticipantId).toBe(clientId);
            done();
        });
    });

    it('should broadcast language changes to all participants', (done) => {
        let client1: Socket;
        let client2: Socket;

        io.on('connection', (socket) => {
            socket.on('language:change', (languageId) => {
                socket.broadcast.emit('room:updated', {
                    language: { id: languageId, name: languageId },
                });
            });
        });

        client1 = ioClient(`http://localhost:${port}`);
        client2 = ioClient(`http://localhost:${port}`);

        let bothConnected = 0;
        const checkBothConnected = () => {
            bothConnected++;
            if (bothConnected === 2) {
                client1.emit('language:change', 'python');
            }
        };

        client1.on('connect', checkBothConnected);
        client2.on('connect', checkBothConnected);

        client2.on('room:updated', (data: any) => {
            expect(data.language.id).toBe('python');
            client1.close();
            client2.close();
            done();
        });
    });

    it('should handle console messages', (done) => {
        const consoleMessage = {
            type: 'output',
            content: 'Test output',
            author: 'Test User',
        };

        io.on('connection', (socket) => {
            socket.on('console:message', (message) => {
                socket.emit('room:updated', {
                    consoleMessages: [
                        {
                            ...message,
                            id: 'msg-123',
                            timestamp: new Date(),
                        },
                    ],
                });
            });
        });

        const client = ioClient(`http://localhost:${port}`);

        client.on('connect', () => {
            client.emit('console:message', consoleMessage);
        });

        client.on('room:updated', (data: any) => {
            expect(data.consoleMessages).toHaveLength(1);
            expect(data.consoleMessages[0].content).toBe(consoleMessage.content);
            client.close();
            done();
        });
    });
});
