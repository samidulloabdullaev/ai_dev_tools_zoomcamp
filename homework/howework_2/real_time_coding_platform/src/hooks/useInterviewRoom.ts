import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import { getDefaultLanguage, getLanguageById, Language } from '@/lib/languages';

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: Date;
  socketId?: string;
}

export interface ConsoleMessage {
  id: string;
  type: 'output' | 'error' | 'info' | 'user';
  content: string;
  timestamp: Date;
  author?: string;
}

export interface InterviewRoom {
  id: string;
  title: string;
  code: string;
  language: Language;
  participants: Participant[];
  consoleMessages: ConsoleMessage[];
  createdAt: Date;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useInterviewRoom = (roomId?: string) => {
  const [room, setRoom] = useState<InterviewRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      autoConnect: false,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('room:updated', (updatedRoom: InterviewRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('participant:joined', (participant: Participant) => {
      console.log('Participant joined:', participant.name);
    });

    socket.on('participant:left', (participantId: string) => {
      console.log('Participant left:', participantId);
    });

    socket.on('error', (message: string) => {
      console.error('Socket error:', message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(
    (hostName: string, title: string = 'Interview Session'): string => {
      const socket = socketRef.current;
      if (!socket) return '';

      let createdRoomId = '';

      socket.connect();
      socket.emit('room:create', { hostName, title }, (roomId: string) => {
        createdRoomId = roomId;
        setIsConnected(true);
        setIsLoading(false);

        // Set current user as host
        const host: Participant = {
          id: uuidv4(),
          name: hostName,
          isHost: true,
          joinedAt: new Date(),
        };
        setCurrentUser(host);
      });

      return createdRoomId;
    },
    []
  );

  const joinRoom = useCallback(
    (roomIdToJoin: string, userName: string): boolean => {
      const socket = socketRef.current;
      if (!socket) return false;

      socket.connect();
      socket.emit('room:join', { roomId: roomIdToJoin, userName }, (success: boolean) => {
        if (success) {
          setIsConnected(true);
          setIsLoading(false);

          const participant: Participant = {
            id: uuidv4(),
            name: userName,
            isHost: false,
            joinedAt: new Date(),
          };
          setCurrentUser(participant);
        } else {
          setIsLoading(false);
        }
      });

      return true;
    },
    []
  );

  const updateCode = useCallback(
    (newCode: string) => {
      const socket = socketRef.current;
      if (!socket || !room) return;

      // Optimistically update local state
      setRoom((prev) => (prev ? { ...prev, code: newCode } : null));

      // Emit to server
      socket.emit('code:update', newCode);
    },
    [room]
  );

  const updateLanguage = useCallback(
    (languageId: string) => {
      const socket = socketRef.current;
      if (!socket || !room) return;

      const newLang = getLanguageById(languageId);
      if (!newLang) return;

      socket.emit('language:change', languageId);
    },
    [room]
  );

  const addConsoleMessage = useCallback(
    (type: ConsoleMessage['type'], content: string, author?: string) => {
      const socket = socketRef.current;
      if (!socket || !room) return;

      const message = {
        type,
        content,
        author,
      };

      socket.emit('console:message', message);
    },
    [room]
  );

  const clearConsole = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !room) return;

    socket.emit('console:clear');
  }, [room]);

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('room:leave');
    socket.disconnect();

    setRoom(null);
    setCurrentUser(null);
    setIsConnected(false);
  }, []);

  // Set loading to false initially if no roomId
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
    }
  }, [roomId]);

  return {
    room,
    currentUser,
    isConnected,
    isLoading,
    createRoom,
    joinRoom,
    updateCode,
    updateLanguage,
    addConsoleMessage,
    clearConsole,
    leaveRoom,
  };
};

// For compatibility with the Index page
export const checkRoomExists = (roomId: string): boolean => {
  // This would need to be implemented via a REST endpoint
  // For now, we'll assume the room exists and handle errors in joinRoom
  return true;
};
