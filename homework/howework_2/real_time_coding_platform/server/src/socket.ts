import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { InterviewRoom, Participant, ConsoleMessage } from './types';
import { getDefaultLanguage, getLanguageById } from './languages';

// In-memory storage for rooms
const rooms = new Map<string, InterviewRoom>();

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        let currentRoomId: string | null = null;
        let currentUserId: string | null = null;

        // Create a new room
        socket.on('room:create', (data: { hostName: string; title: string }, callback) => {
            const roomId = uuidv4().substring(0, 8);
            const userId = uuidv4();
            const defaultLang = getDefaultLanguage();

            const host: Participant = {
                id: userId,
                name: data.hostName,
                isHost: true,
                joinedAt: new Date(),
                socketId: socket.id,
            };

            const newRoom: InterviewRoom = {
                id: roomId,
                title: data.title || 'Interview Session',
                code: defaultLang.defaultCode,
                language: defaultLang,
                participants: [host],
                consoleMessages: [
                    {
                        id: uuidv4(),
                        type: 'info',
                        content: 'Machine Ready',
                        timestamp: new Date(),
                    },
                ],
                createdAt: new Date(),
            };

            rooms.set(roomId, newRoom);
            socket.join(roomId);
            currentRoomId = roomId;
            currentUserId = userId;

            console.log(`Room created: ${roomId} by ${data.hostName}`);
            callback(roomId);

            // Send initial room state
            socket.emit('room:updated', newRoom);
        });

        // Join an existing room
        socket.on('room:join', (data: { roomId: string; userName: string }, callback) => {
            const room = rooms.get(data.roomId);

            if (!room) {
                callback(false);
                socket.emit('error', 'Room not found');
                return;
            }

            const userId = uuidv4();
            const participant: Participant = {
                id: userId,
                name: data.userName,
                isHost: false,
                joinedAt: new Date(),
                socketId: socket.id,
            };

            room.participants.push(participant);
            room.consoleMessages.push({
                id: uuidv4(),
                type: 'info',
                content: `${data.userName} joined the session`,
                timestamp: new Date(),
            });

            socket.join(data.roomId);
            currentRoomId = data.roomId;
            currentUserId = userId;

            console.log(`User ${data.userName} joined room ${data.roomId}`);
            callback(true);

            // Notify all clients in the room
            io.to(data.roomId).emit('room:updated', room);
            socket.to(data.roomId).emit('participant:joined', participant);
        });

        // Update code
        socket.on('code:update', (code: string) => {
            if (!currentRoomId) return;

            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.code = code;

            // Broadcast to all clients in the room except sender
            socket.to(currentRoomId).emit('room:updated', room);
        });

        // Change language
        socket.on('language:change', (languageId: string) => {
            if (!currentRoomId) return;

            const room = rooms.get(currentRoomId);
            if (!room) return;

            const newLang = getLanguageById(languageId);
            if (!newLang) return;

            room.language = newLang;
            room.code = newLang.defaultCode;
            room.consoleMessages.push({
                id: uuidv4(),
                type: 'info',
                content: `Language changed to ${newLang.name}`,
                timestamp: new Date(),
            });

            // Broadcast to all clients in the room
            io.to(currentRoomId).emit('room:updated', room);
        });

        // Add console message
        socket.on('console:message', (message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => {
            if (!currentRoomId) return;

            const room = rooms.get(currentRoomId);
            if (!room) return;

            const consoleMessage: ConsoleMessage = {
                ...message,
                id: uuidv4(),
                timestamp: new Date(),
            };

            room.consoleMessages.push(consoleMessage);

            // Broadcast to all clients in the room
            io.to(currentRoomId).emit('room:updated', room);
        });

        // Clear console
        socket.on('console:clear', () => {
            if (!currentRoomId) return;

            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.consoleMessages = [
                {
                    id: uuidv4(),
                    type: 'info',
                    content: 'Console cleared',
                    timestamp: new Date(),
                },
            ];

            // Broadcast to all clients in the room
            io.to(currentRoomId).emit('room:updated', room);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);

            if (currentRoomId && currentUserId) {
                const room = rooms.get(currentRoomId);
                if (room) {
                    // Remove participant
                    room.participants = room.participants.filter((p) => p.id !== currentUserId);

                    // If no participants left, delete the room
                    if (room.participants.length === 0) {
                        rooms.delete(currentRoomId);
                        console.log(`Room ${currentRoomId} deleted (no participants)`);
                    } else {
                        // Notify remaining participants
                        io.to(currentRoomId).emit('participant:left', currentUserId);
                        io.to(currentRoomId).emit('room:updated', room);
                    }
                }
            }
        });

        // Leave room explicitly
        socket.on('room:leave', () => {
            if (currentRoomId && currentUserId) {
                const room = rooms.get(currentRoomId);
                if (room) {
                    room.participants = room.participants.filter((p) => p.id !== currentUserId);

                    if (room.participants.length === 0) {
                        rooms.delete(currentRoomId);
                    } else {
                        io.to(currentRoomId).emit('participant:left', currentUserId);
                        io.to(currentRoomId).emit('room:updated', room);
                    }

                    socket.leave(currentRoomId);
                }

                currentRoomId = null;
                currentUserId = null;
            }
        });
    });
};
