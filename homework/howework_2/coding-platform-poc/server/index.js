const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Coding Platform Backend is running');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for PoC
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', code);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.use(express.json());

app.post('/execute', async (req, res) => {
  const { code, language } = req.body;
  try {
    const output = await executeCode(language, code);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCode = (language, code) => {
  return new Promise((resolve, reject) => {
    // Map language to file extension and command
    const langConfig = {
      'javascript': { ext: 'js', cmd: 'node' },
      'python': { ext: 'py', cmd: 'python3' },
      'java': { ext: 'java', cmd: 'java' },
      'cpp': { ext: 'cpp', cmd: 'g++' }
    };

    const config = langConfig[language] || langConfig['javascript'];
    const fileName = `temp_${Date.now()}.${config.ext}`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, code);

    const command = `${config.cmd} ${filePath}`;

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      fs.unlinkSync(filePath); // Cleanup

      if (error) {
        // If it's a timeout, error.killed will be true
        if (error.killed) {
          resolve('Error: Execution timed out (5s limit)');
        } else {
          resolve(stderr || error.message);
        }
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = { app, server, io };
