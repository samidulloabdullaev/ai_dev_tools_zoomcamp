import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

const mocks = vi.hoisted(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
}));

vi.mock('socket.io-client', () => ({
    default: () => ({
        emit: mocks.emit,
        on: mocks.on,
        off: mocks.off,
    }),
}));

// Mock CodeEditor to avoid Monaco issues in test environment
vi.mock('./components/CodeEditor', () => ({
    default: ({ code, onChange }) => (
        <textarea
            data-testid="code-editor"
            value={code}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders login screen initially', () => {
        render(<App />);
        expect(screen.getByText('Code Interview')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Room ID')).toBeInTheDocument();
        expect(screen.getByText('Join Room')).toBeInTheDocument();
    });

    test('joins a room and renders editor', () => {
        render(<App />);

        const input = screen.getByPlaceholderText('Enter Room ID');
        const joinButton = screen.getByText('Join Room');

        fireEvent.change(input, { target: { value: 'test-room' } });
        fireEvent.click(joinButton);

        expect(mocks.emit).toHaveBeenCalledWith('join-room', 'test-room');
        expect(screen.getByText('Room: test-room')).toBeInTheDocument();
        expect(screen.getByText('Run Code')).toBeInTheDocument();
    });

    test('updates language state', () => {
        render(<App />);

        // Join room first
        const input = screen.getByPlaceholderText('Enter Room ID');
        const joinButton = screen.getByText('Join Room');
        fireEvent.change(input, { target: { value: 'test-room' } });
        fireEvent.click(joinButton);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'python' } });

        expect(select.value).toBe('python');
    });

    test('run code button execution', () => {
        render(<App />);

        // Join room
        fireEvent.change(screen.getByPlaceholderText('Enter Room ID'), { target: { value: 'test-room' } });
        fireEvent.click(screen.getByText('Join Room'));

        // Click run code
        fireEvent.click(screen.getByText('Run Code'));

        // Check output (mocked execution)
        expect(screen.getByText(/Running javascript code/)).toBeInTheDocument();
    });
});
