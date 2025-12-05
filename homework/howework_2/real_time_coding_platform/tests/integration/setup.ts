import '@testing-library/jest-dom';

// Mock Socket.io client for integration tests
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
    })),
}));
