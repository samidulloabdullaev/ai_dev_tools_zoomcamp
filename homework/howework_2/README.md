Act as a Senior Full Stack Engineer. I need you to build a Proof of Concept (PoC) for an online coding interview platform. 

**Core Requirements:**
1. **Real-time Collaboration:** Users should be able to create a unique room (via a link) and edit code simultaneously. Changes must update in real-time for all users in that room.
2. **Code Editor:** The frontend must include a code editor that supports syntax highlighting for JavaScript and Python.
3. **Architecture:** Use a monorepo structure with a backend and frontend folder.
4. **Execution:** For now, just create the UI button for "Run Code". We will implement the actual WASM execution logic in a later step.

**Technology Stack:**
* **Frontend:** React (initialized with Vite), Tailwind CSS for styling. 
* **Editor:** Monaco Editor (via @monaco-editor/react) OR CodeMirror.
* **Backend:** Node.js with Express.
* **Real-time:** Socket.io (for syncing code changes between clients).

**Deliverables:**
Please provide the complete code structure and file contents for the following:
1.  **Project Structure:** How folders should be organized.
2.  **Backend (`/server`):** An Express server setup with Socket.io to handle room connections and broadcasting code changes.
3.  **Frontend (`/client`):** A React app with a `CodeEditor` component that connects to the socket server to send/receive keystrokes.
4.  **Instructions:** A brief guide on how to install dependencies and run both.

Please write the code implementation now.