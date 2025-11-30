# Online Coding Interview Platform PoC

This is a Proof of Concept for a real-time collaborative coding interview platform.

## Prerequisites

- Node.js and npm installed.

## Installation

1.  Open a terminal in this directory.
2.  Install dependencies for both backend and frontend:
    ```bash
    npm install
    ```

## Running the Application

You can run both the server and client concurrently (if you add a script for it) or in separate terminals.

### Option 1: Separate Terminals

1.  **Backend**:
    ```bash
    npm run server
    ```
    The server will start on `http://localhost:3001`.

2.  **Frontend**:
    ```bash
    npm run client
    ```
    The client will start on `http://localhost:5173`.

## Usage

1.  Open `http://localhost:5173` in your browser.
2.  Enter a Room ID (e.g., "room1") and click "Join Room".
3.  Open a second tab/window at `http://localhost:5173`.
4.  Enter the **same** Room ID and join.
5.  Type in the editor in one tab; changes should appear in the other tab in real-time.
6.  Click "Run Code" to see the mock execution output.

## Project Structure

-   `server/`: Node.js + Express + Socket.io backend.
-   `client/`: React + Vite + Monaco Editor frontend.
