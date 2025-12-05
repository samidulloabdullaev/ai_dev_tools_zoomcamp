# Real-Time Collaborative Coding Platform

A powerful real-time collaborative coding interview platform built with React, TypeScript, Express.js, and Socket.io. Share a link, collaborate in real-time, and evaluate candidates with instant code execution.

## ✨ Features

- **🔗 Easy Room Creation & Sharing**: Create interview rooms with a single click and share via link
- **👥 Real-Time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- **💻 Multi-Language Support**: Syntax highlighting for JavaScript, TypeScript, Python, Java, C++, and Go
- **▶️ In-Browser Code Execution**: Run JavaScript and TypeScript code directly in the browser
- **🎨 Beautiful IDE Interface**: VS Code-inspired dark theme with Monaco editor
- **📊 Live Console Output**: Real-time code execution results and error messages
- **👤 Participant Management**: See who's in the room and track participant activity

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for blazing fast development
- **Monaco Editor** (VS Code's editor)
- **Socket.io Client** for real-time communication
- **shadcn/ui** + **Tailwind CSS** for beautiful UI
- **React Router** for navigation

### Backend
- **Express.js** with **TypeScript**
- **Socket.io** for WebSocket communication
- **CORS** enabled for local development
- **In-memory room storage** (production would use Redis/Database)

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and npm

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd real_time_coding_platform
```

2. **Install dependencies**
```bash
# Install client dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

3. **Environment Configuration** (Optional)
Create a `.env` file in the root directory:
```env
VITE_SOCKET_URL=http://localhost:3001
```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both client and server concurrently:
```bash
npm run dev
```

This will start:
- **Client**: http://localhost:8080
- **Server**: http://localhost:3001

### Running Separately

**Client only:**
```bash
npm run dev:client
```

**Server only:**
```bash
npm run dev:server
```

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Integration Tests
```bash
npm run test:integration
```

## 📝 Usage Guide

### Creating an Interview Room

1. Navigate to http://localhost:8080
2. Enter your name and optional session title
3. Click "Create Interview Room"
4. Share the room link with candidates

### Joining an Interview Room

1. Receive the room link from the interviewer
2. Navigate to the link or enter the room ID on the homepage
3. Enter your name
4. Click "Join Room"

### During the Interview

- **Write Code**: Use the Monaco editor with full syntax highlighting
- **Change Language**: Select from the language dropdown (JavaScript, TypeScript, Python, Java, C++, Go)
- **Run Code**: Click the "Run" button to execute JavaScript/TypeScript in the browser
- **View Output**: Check the console panel for execution results and errors
- **Collaborate**: All participants see code changes in real-time

## 🏗️ Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │    (Socket.io)             │                 │
│  React Client   │◄──────────────────────────►│  Express Server │
│  (Port 8080)    │                            │  (Port 3001)    │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
        │                                              │
        │                                              │
   Monaco Editor                                  In-Memory
   Code Execution                                 Room Storage
```

### Real-Time Events

**Client → Server:**
- `room:create` - Create new room
- `room:join` - Join existing room
- `code:update` - Update code content
- `language:change` - Change programming language
- `console:message` - Add console message
- `console:clear` - Clear console
- `room:leave` - Leave room

**Server → Client:**
- `room:updated` - Room state changed
- `participant:joined` - New participant
- `participant:left` - Participant disconnected
- `error` - Error message

## 📂 Project Structure

```
real_time_coding_platform/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── __tests__/      # Unit tests
├── server/
│   └── src/
│       ├── index.ts    # Server entry point
│       ├── socket.ts   # Socket.io handlers
│       ├── types.ts    # TypeScript types
│       └── languages.ts# Language definitions
├── package.json        # Client dependencies
└── README.md           # This file
```

## 🔧 Configuration

### Client Configuration
- **Port**: 8080 (configurable in `vite.config.ts`)
- **Socket URL**: http://localhost:3001 (configurable via `.env`)

### Server Configuration
- **Port**: 3001 (configurable via environment variable `PORT`)
- **Allowed Origins**: http://localhost:8080 (configurable via `CLIENT_URL`)

## 🎨 Supported Languages

| Language   | Syntax Highlighting | In-Browser Execution |
|------------|---------------------|----------------------|
| JavaScript | ✅                  | ✅                   |
| TypeScript | ✅                  | ✅                   |
| Python     | ✅                  | ⏳ Coming Soon       |
| Java       | ✅                  | ⏳ Coming Soon       |
| C++        | ✅                  | ⏳ Coming Soon       |
| Go         | ✅                  | ⏳ Coming Soon       |

## 🚀 Production Deployment

### Build for Production

```bash
# Build client
npm run build

# Build server
cd server && npm run build
```

### Production Recommendations

1. **Use a Database**: Replace in-memory storage with Redis or PostgreSQL
2. **Add Authentication**: Implement user authentication and room passwords
3. **Enable HTTPS**: Use SSL certificates for secure WebSocket connections
4. **Add Rate Limiting**: Prevent abuse with rate limiting middleware
5. **Error Monitoring**: Integrate Sentry or similar error tracking
6. **Horizontal Scaling**: Use Redis adapter for Socket.io clustering

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Real-time communication via [Socket.io](https://socket.io/)

---

**Happy Coding! 🎉**
