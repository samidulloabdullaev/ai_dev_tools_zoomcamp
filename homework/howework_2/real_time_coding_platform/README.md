# CodeSync - Real-Time Coding Interview Platform

A full-stack collaborative coding platform built with React, Node.js, and Socket.IO. Features real-time code synchronization, syntax highlighting, and client-side code execution using WebAssembly.

![Platform Preview](https://via.placeholder.com/800x400?text=CodeSync+Platform)

## 🚀 Features

- **Real-Time Collaboration**: Code changes sync instantly across all users in a room
- **Room Management**: Create unique interview rooms with shareable links
- **Syntax Highlighting**: Full support for JavaScript and Python with Prism.js
- **Client-Side Execution**: 
  - **Python**: Uses Pyodide (WebAssembly) for safe browser-based execution
  - **JavaScript**: Uses safe Function constructor for sandboxed execution
- **Modern UI**: Dark theme with responsive design

## 📦 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 (Vite) |
| Backend | Node.js + Express |
| Real-Time | Socket.IO |
| Syntax Highlighting | `react-simple-code-editor` + `prismjs` |
| Python WASM | Pyodide v0.24.1 |
| Styling | Custom CSS (Dark Theme) |

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
cd /workspaces/ai_dev_tools_zoomcamp/homework/howework_2/real_time_coding_platform

# Install all dependencies (root, client, and server)
npm run install:all
```

### Running in Development Mode

```bash
# Run both frontend and backend concurrently
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Running Integration Tests

```bash
# Run the test suite
npm test
```

Tests verify:
- HTTP endpoints return 200 OK
- Socket.IO connection establishment
- Room creation and management

## 🐳 Docker Deployment

### Build the Docker Image

```bash
docker build -t codesync-platform .
```

### Run the Container

```bash
docker run -p 3000:3000 codesync-platform
```

Access the application at http://localhost:3000

## 📁 Project Structure

```
real_time_coding_platform/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Room)
│   │   ├── utils/          # Code runner utilities
│   │   └── App.jsx         # Main app with routing
│   └── package.json
├── server/                 # Express backend
│   ├── tests/              # Integration tests
│   ├── index.js            # Server entry point
│   └── package.json
├── Dockerfile              # Multi-stage Docker build
├── package.json            # Root package with scripts
└── README.md
```

## 🔧 Key Libraries

### Syntax Highlighting
- **Library**: `react-simple-code-editor` + `prismjs`
- **Languages**: JavaScript, Python
- **Theme**: Custom dark theme (GitHub-inspired)

### WASM Execution
- **Python**: `Pyodide v0.24.1` - Full Python interpreter compiled to WebAssembly
- **JavaScript**: Safe `Function` constructor with console capture

### Real-Time Communication
- **Library**: `Socket.IO` (client + server)
- **Events**: `code-change`, `language-change`, `join-room`, `user-joined`, `user-left`

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms/:roomId` | Get room info |

## 🧪 Testing

The project uses Jest and Supertest for integration testing:

```bash
# Run tests with coverage
cd server && npm test
```

## 📄 License

MIT License
