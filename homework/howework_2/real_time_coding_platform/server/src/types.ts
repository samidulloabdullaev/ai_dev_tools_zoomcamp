export interface Participant {
    id: string;
    name: string;
    isHost: boolean;
    joinedAt: Date;
    socketId: string;
}

export interface ConsoleMessage {
    id: string;
    type: 'output' | 'error' | 'info' | 'user';
    content: string;
    timestamp: Date;
    author?: string;
}

export interface Language {
    id: string;
    name: string;
    monacoId: string;
    defaultCode: string;
    canExecuteInBrowser: boolean;
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

export interface SocketEvents {
    // Client to Server
    'room:create': (data: { hostName: string; title: string }, callback: (roomId: string) => void) => void;
    'room:join': (data: { roomId: string; userName: string }, callback: (success: boolean) => void) => void;
    'room:leave': () => void;
    'code:update': (code: string) => void;
    'language:change': (languageId: string) => void;
    'console:clear': () => void;
    'console:message': (message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void;

    // Server to Client
    'room:updated': (room: InterviewRoom) => void;
    'participant:joined': (participant: Participant) => void;
    'participant:left': (participantId: string) => void;
    'error': (message: string) => void;
}
