import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInterviewRoom, rooms, checkRoomExists } from '@/hooks/useInterviewRoom';

describe('useInterviewRoom', () => {
  beforeEach(() => {
    // Clear all rooms before each test
    rooms.clear();
  });

  describe('createRoom', () => {
    it('should create a room with host as participant', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      let roomId: string;
      act(() => {
        roomId = result.current.createRoom('Host User', 'Test Session');
      });

      expect(roomId!).toBeDefined();
      expect(roomId!.length).toBe(8);
      expect(result.current.room).not.toBeNull();
      expect(result.current.room?.title).toBe('Test Session');
      expect(result.current.currentUser?.name).toBe('Host User');
      expect(result.current.currentUser?.isHost).toBe(true);
      expect(result.current.isConnected).toBe(true);
    });

    it('should set default code for the default language', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
      });

      expect(result.current.room?.language.id).toBe('javascript');
      expect(result.current.room?.code).toContain('function fib');
    });
  });

  describe('checkRoomExists', () => {
    it('should return true for existing room', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      let roomId: string;
      act(() => {
        roomId = result.current.createRoom('Host', 'Session');
      });

      expect(checkRoomExists(roomId!)).toBe(true);
    });

    it('should return false for non-existing room', () => {
      expect(checkRoomExists('invalid-id')).toBe(false);
    });
  });

  describe('joinRoom', () => {
    it('should join an existing room successfully', () => {
      const { result: hostResult } = renderHook(() => useInterviewRoom());
      
      let roomId: string;
      act(() => {
        roomId = hostResult.current.createRoom('Host', 'Session');
      });

      const { result: guestResult } = renderHook(() => useInterviewRoom(roomId!));
      
      let success: boolean;
      act(() => {
        success = guestResult.current.joinRoom(roomId!, 'Guest User');
      });

      expect(success!).toBe(true);
      expect(guestResult.current.currentUser?.name).toBe('Guest User');
      expect(guestResult.current.currentUser?.isHost).toBe(false);
      expect(guestResult.current.isConnected).toBe(true);
    });

    it('should fail to join non-existing room', () => {
      const { result } = renderHook(() => useInterviewRoom('invalid-id'));
      
      let success: boolean;
      act(() => {
        success = result.current.joinRoom('invalid-id', 'Guest');
      });

      expect(success!).toBe(false);
      expect(result.current.currentUser).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('updateLanguage', () => {
    it('should update language and reset code to default template', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
      });

      // Initially JavaScript
      expect(result.current.room?.language.id).toBe('javascript');
      expect(result.current.room?.code).toContain('function fib');

      act(() => {
        result.current.updateLanguage('python');
      });

      expect(result.current.room?.language.id).toBe('python');
      expect(result.current.room?.code).toContain('def fibonacci');
    });

    it('should add console message when language changes', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
      });

      const initialMessageCount = result.current.room?.consoleMessages.length ?? 0;

      act(() => {
        result.current.updateLanguage('typescript');
      });

      expect(result.current.room?.consoleMessages.length).toBe(initialMessageCount + 1);
      expect(result.current.room?.consoleMessages.at(-1)?.content).toContain('TypeScript');
    });
  });

  describe('updateCode', () => {
    it('should update code content', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
      });

      act(() => {
        result.current.updateCode('const newCode = "test";');
      });

      expect(result.current.room?.code).toBe('const newCode = "test";');
    });
  });

  describe('leaveRoom', () => {
    it('should disconnect user from room', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        result.current.leaveRoom();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.currentUser).toBeNull();
    });

    it('should delete room when last participant leaves', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      let roomId: string;
      act(() => {
        roomId = result.current.createRoom('Host', 'Session');
      });

      expect(rooms.has(roomId!)).toBe(true);

      act(() => {
        result.current.leaveRoom();
      });

      expect(rooms.has(roomId!)).toBe(false);
    });
  });

  describe('clearConsole', () => {
    it('should clear console messages', () => {
      const { result } = renderHook(() => useInterviewRoom());
      
      act(() => {
        result.current.createRoom('Host', 'Session');
        result.current.addConsoleMessage('output', 'Test output');
        result.current.addConsoleMessage('error', 'Test error');
      });

      expect(result.current.room?.consoleMessages.length).toBeGreaterThan(1);

      act(() => {
        result.current.clearConsole();
      });

      expect(result.current.room?.consoleMessages.length).toBe(1);
      expect(result.current.room?.consoleMessages[0].content).toBe('Console cleared');
    });
  });
});
