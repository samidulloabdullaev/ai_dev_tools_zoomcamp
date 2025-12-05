import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultLanguage, getLanguageById, Language } from '@/lib/languages';

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: Date;
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

// Simulated real-time state (in production, this would use WebSockets)
export const rooms = new Map<string, InterviewRoom>();

// Check if a room exists without joining
export const checkRoomExists = (roomId: string): boolean => {
  return rooms.has(roomId);
};

export const useInterviewRoom = (roomId?: string) => {
  const [room, setRoom] = useState<InterviewRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const createRoom = useCallback((hostName: string, title: string = 'Interview Session'): string => {
    const newRoomId = uuidv4().substring(0, 8);
    const defaultLang = getDefaultLanguage();
    
    const host: Participant = {
      id: uuidv4(),
      name: hostName,
      isHost: true,
      joinedAt: new Date(),
    };

    const newRoom: InterviewRoom = {
      id: newRoomId,
      title,
      code: defaultLang.defaultCode,
      language: defaultLang,
      participants: [host],
      consoleMessages: [{
        id: uuidv4(),
        type: 'info',
        content: 'Machine Ready',
        timestamp: new Date(),
      }],
      createdAt: new Date(),
    };

    rooms.set(newRoomId, newRoom);
    setRoom(newRoom);
    setCurrentUser(host);
    setIsConnected(true);
    setIsLoading(false);

    return newRoomId;
  }, []);

  const joinRoom = useCallback((roomIdToJoin: string, userName: string): boolean => {
    const existingRoom = rooms.get(roomIdToJoin);
    
    if (!existingRoom) {
      setIsLoading(false);
      return false;
    }

    const participant: Participant = {
      id: uuidv4(),
      name: userName,
      isHost: false,
      joinedAt: new Date(),
    };

    existingRoom.participants.push(participant);
    existingRoom.consoleMessages.push({
      id: uuidv4(),
      type: 'info',
      content: `${userName} joined the session`,
      timestamp: new Date(),
    });

    rooms.set(roomIdToJoin, existingRoom);
    setRoom({ ...existingRoom });
    setCurrentUser(participant);
    setIsConnected(true);
    setIsLoading(false);

    return true;
  }, []);

  const updateCode = useCallback((newCode: string) => {
    if (!room) return;

    const updatedRoom = { ...room, code: newCode };
    rooms.set(room.id, updatedRoom);
    setRoom(updatedRoom);
  }, [room]);

  const updateLanguage = useCallback((languageId: string) => {
    if (!room) return;

    const newLang = getLanguageById(languageId);
    if (!newLang) return;

    const updatedRoom = { 
      ...room, 
      language: newLang,
      code: newLang.defaultCode,
    };
    rooms.set(room.id, updatedRoom);
    setRoom(updatedRoom);

    addConsoleMessage('info', `Language changed to ${newLang.name}`);
  }, [room]);

  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], content: string, author?: string) => {
    if (!room) return;

    const message: ConsoleMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      author,
    };

    const updatedRoom = {
      ...room,
      consoleMessages: [...room.consoleMessages, message],
    };
    rooms.set(room.id, updatedRoom);
    setRoom(updatedRoom);
  }, [room]);

  const clearConsole = useCallback(() => {
    if (!room) return;

    const updatedRoom = {
      ...room,
      consoleMessages: [{
        id: uuidv4(),
        type: 'info' as const,
        content: 'Console cleared',
        timestamp: new Date(),
      }],
    };
    rooms.set(room.id, updatedRoom);
    setRoom(updatedRoom);
  }, [room]);

  const leaveRoom = useCallback(() => {
    if (!room || !currentUser) return;

    const updatedParticipants = room.participants.filter(p => p.id !== currentUser.id);
    
    if (updatedParticipants.length === 0) {
      rooms.delete(room.id);
    } else {
      const updatedRoom = { ...room, participants: updatedParticipants };
      rooms.set(room.id, updatedRoom);
    }

    setRoom(null);
    setCurrentUser(null);
    setIsConnected(false);
  }, [room, currentUser]);

  // Poll for updates (simulating real-time)
  useEffect(() => {
    if (!room?.id || !isConnected) return;

    pollingRef.current = setInterval(() => {
      const latestRoom = rooms.get(room.id);
      if (latestRoom && JSON.stringify(latestRoom) !== JSON.stringify(room)) {
        setRoom({ ...latestRoom });
      }
    }, 500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [room?.id, isConnected]);

  // Check if room exists on mount
  useEffect(() => {
    if (roomId) {
      const existingRoom = rooms.get(roomId);
      if (existingRoom) {
        setRoom(existingRoom);
      }
      setIsLoading(false);
    } else {
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
