import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInterviewRoom, checkRoomExists } from '@/hooks/useInterviewRoom';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    id: 'mock-socket-id',
  })),
}));

describe('useInterviewRoom', () => {
  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      id: 'mock-socket-id',
    };
    (io as any).mockReturnValue(mockSocket);
  });

  describe('initialization', () => {
    it('should initialize socket connection', () => {
      renderHook(() => useInterviewRoom());

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ autoConnect: false })
      );
    });

    it('should set up socket event listeners', () => {
      renderHook(() => useInterviewRoom());

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('room:updated', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('participant:joined', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('participant:left', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('createRoom', () => {
    it('should emit room:create event and connect socket', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.createRoom('Host User', 'Test Session');

      expect(mockSocket.connect).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'room:create',
        { hostName: 'Host User', title: 'Test Session' },
        expect.any(Function)
      );
    });

    it('should set isConnected to true when room is created', async () => {
      mockSocket.emit.mockImplementation((event: string, data: any, callback?: Function) => {
        if (event === 'room:create' && callback) {
          callback('test-room-123');
        }
      });

      const { result } = renderHook(() => useInterviewRoom());

      result.current.createRoom('Host User', 'Test Session');

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  describe('joinRoom', () => {
    it('should emit room:join event', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.joinRoom('room-123', 'Guest User');

      expect(mockSocket.connect).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'room:join',
        { roomId: 'room-123', userName: 'Guest User' },
        expect.any(Function)
      );
    });

    it('should set isConnected when join succeeds', async () => {
      mockSocket.emit.mockImplementation((event: string, data: any, callback?: Function) => {
        if (event === 'room:join' && callback) {
          callback(true);
        }
      });

      const { result } = renderHook(() => useInterviewRoom());

      result.current.joinRoom('room-123', 'Guest User');

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  describe('updateCode', () => {
    it('should not emit when room is null', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.updateCode('new code');

      // Should not emit when no room is set
      expect(mockSocket.emit).not.toHaveBeenCalledWith('code:update', expect.anything());
    });
  });

  describe('updateLanguage', () => {
    it('should not emit when room is null', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.updateLanguage('python');

      // Should not emit when no room is set  
      expect(mockSocket.emit).not.toHaveBeenCalledWith('language:change', expect.anything());
    });
  });

  describe('addConsoleMessage', () => {
    it('should not emit when room is null', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.addConsoleMessage('output', 'Test message', 'User');

      // Should not emit when no room is set
      expect(mockSocket.emit).not.toHaveBeenCalledWith('console:message', expect.anything());
    });
  });

  describe('clearConsole', () => {
    it('should not emit when room is null', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.clearConsole();

      // Should not emit when no room is set
      expect(mockSocket.emit).not.toHaveBeenCalledWith('console:clear');
    });
  });

  describe('leaveRoom', () => {
    it('should emit room:leave and disconnect socket', () => {
      const { result } = renderHook(() => useInterviewRoom());

      result.current.leaveRoom();

      expect(mockSocket.emit).toHaveBeenCalledWith('room:leave');
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('checkRoomExists', () => {
    it('should return true for any room ID (client-side implementation)', () => {
      expect(checkRoomExists('any-id')).toBe(true);
    });
  });
});
