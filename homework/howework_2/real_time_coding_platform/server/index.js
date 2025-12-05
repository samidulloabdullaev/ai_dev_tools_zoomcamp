const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Socket.IO setup
const io = new Server(server, {
    cors: corsOptions
});

// Store rooms data (in production, use Redis or a database)
const rooms = new Map();

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/rooms', (req, res) => {
    const roomId = uuidv4();
    rooms.set(roomId, {
        id: roomId,
        code: '',
        language: 'javascript',
        users: [],
        createdAt: new Date().toISOString()
    });
    res.json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
        // Auto-create room if it doesn't exist (for direct URL access)
        rooms.set(roomId, {
            id: roomId,
            code: '',
            language: 'javascript',
            users: [],
            createdAt: new Date().toISOString()
        });
        return res.json({ exists: true, room: rooms.get(roomId) });
    }

    res.json({ exists: true, room });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                id: roomId,
                code: '',
                language: 'javascript',
                users: [],
                createdAt: new Date().toISOString()
            });
        }

        const room = rooms.get(roomId);
        room.users.push(socket.id);

        // Send current room state to the joining user
        socket.emit('room-state', {
            code: room.code,
            language: room.language,
            userCount: room.users.length
        });

        // Notify others about new user
        socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            userCount: room.users.length
        });

        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('code-change', ({ roomId, code }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.code = code;
            socket.to(roomId).emit('code-update', { code });
        }
    });

    socket.on('language-change', ({ roomId, language }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.language = language;
            socket.to(roomId).emit('language-update', { language });
        }
    });

    socket.on('console-output', ({ roomId, output }) => {
        socket.to(roomId).emit('console-output', { output });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove user from all rooms they were in
        rooms.forEach((room, roomId) => {
            const userIndex = room.users.indexOf(socket.id);
            if (userIndex !== -1) {
                room.users.splice(userIndex, 1);
                io.to(roomId).emit('user-left', {
                    userId: socket.id,
                    userCount: room.users.length
                });
            }
        });
    });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app, server, io };
