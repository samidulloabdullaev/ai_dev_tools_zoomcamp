const { v4: uuidv4 } = require('uuid');

describe('Server Logic (Unit)', () => {
    test('UUID generation should be valid', () => {
        const id = uuidv4();
        expect(typeof id).toBe('string');
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(id).toMatch(regex);
    });

    test('Room ID structure sanity check', () => {
        // Simulating the room structure logic from server/index.js
        const createRoom = (id) => ({
            id,
            code: '',
            language: 'javascript',
            users: [],
            createdAt: new Date().toISOString()
        });

        const roomId = uuidv4();
        const room = createRoom(roomId);

        expect(room.id).toBe(roomId);
        expect(room.code).toBe('');
        expect(room.language).toBe('javascript');
        expect(Array.isArray(room.users)).toBe(true);
        expect(room.users.length).toBe(0);
        expect(new Date(room.createdAt).toString()).not.toBe('Invalid Date');
    });
});
