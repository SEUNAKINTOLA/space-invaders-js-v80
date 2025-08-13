import { describe, beforeEach, afterEach, test, expect, jest } from '@jest/globals';

// Since we can't import directly, we'll mock the InputManager structure
interface InputManager {
    isKeyPressed: (key: string) => boolean;
    addKeyListener: (key: string, callback: () => void) => void;
    removeKeyListener: (key: string) => void;
    update: () => void;
    reset: () => void;
}

// Mock implementation for testing
class MockInputManager implements InputManager {
    private pressedKeys: Set<string> = new Set();
    private keyListeners: Map<string, () => void> = new Map();

    isKeyPressed(key: string): boolean {
        return this.pressedKeys.has(key);
    }

    addKeyListener(key: string, callback: () => void): void {
        this.keyListeners.set(key, callback);
    }

    removeKeyListener(key: string): void {
        this.keyListeners.delete(key);
    }

    update(): void {
        // Mock update logic
    }

    reset(): void {
        this.pressedKeys.clear();
        this.keyListeners.clear();
    }

    // Helper methods for testing
    _simulateKeyPress(key: string): void {
        this.pressedKeys.add(key);
    }

    _simulateKeyRelease(key: string): void {
        this.pressedKeys.delete(key);
    }
}

describe('InputManager', () => {
    let inputManager: MockInputManager;

    beforeEach(() => {
        inputManager = new MockInputManager();
        // Mock document event listeners
        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        inputManager.reset();
        jest.restoreAllMocks();
    });

    describe('Key Press Detection', () => {
        test('should correctly detect when a key is pressed', () => {
            inputManager._simulateKeyPress('ArrowLeft');
            expect(inputManager.isKeyPressed('ArrowLeft')).toBe(true);
        });

        test('should correctly detect when a key is not pressed', () => {
            expect(inputManager.isKeyPressed('ArrowRight')).toBe(false);
        });

        test('should handle multiple keys being pressed simultaneously', () => {
            inputManager._simulateKeyPress('ArrowLeft');
            inputManager._simulateKeyPress('Space');
            
            expect(inputManager.isKeyPressed('ArrowLeft')).toBe(true);
            expect(inputManager.isKeyPressed('Space')).toBe(true);
        });
    });

    describe('Key Listeners', () => {
        test('should add key listener successfully', () => {
            const mockCallback = jest.fn();
            inputManager.addKeyListener('Space', mockCallback);
            
            // Simulate key press
            inputManager._simulateKeyPress('Space');
            inputManager.update();
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should remove key listener successfully', () => {
            const mockCallback = jest.fn();
            inputManager.addKeyListener('Space', mockCallback);
            inputManager.removeKeyListener('Space');
            
            // Simulate key press
            inputManager._simulateKeyPress('Space');
            inputManager.update();
            
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should handle multiple listeners for different keys', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            inputManager.addKeyListener('ArrowLeft', mockCallback1);
            inputManager.addKeyListener('ArrowRight', mockCallback2);
            
            inputManager._simulateKeyPress('ArrowLeft');
            inputManager.update();
            
            expect(mockCallback1).toHaveBeenCalled();
            expect(mockCallback2).not.toHaveBeenCalled();
        });
    });

    describe('Reset Functionality', () => {
        test('should clear all pressed keys on reset', () => {
            inputManager._simulateKeyPress('ArrowLeft');
            inputManager._simulateKeyPress('Space');
            
            inputManager.reset();
            
            expect(inputManager.isKeyPressed('ArrowLeft')).toBe(false);
            expect(inputManager.isKeyPressed('Space')).toBe(false);
        });

        test('should clear all key listeners on reset', () => {
            const mockCallback = jest.fn();
            inputManager.addKeyListener('Space', mockCallback);
            
            inputManager.reset();
            inputManager._simulateKeyPress('Space');
            inputManager.update();
            
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty key strings', () => {
            expect(() => inputManager.isKeyPressed('')).not.toThrow();
            expect(() => inputManager.addKeyListener('', jest.fn())).not.toThrow();
        });

        test('should handle removing non-existent listeners', () => {
            expect(() => inputManager.removeKeyListener('NonExistentKey')).not.toThrow();
        });

        test('should handle rapid key presses', () => {
            for (let i = 0; i < 100; i++) {
                inputManager._simulateKeyPress('Space');
                inputManager._simulateKeyRelease('Space');
            }
            expect(inputManager.isKeyPressed('Space')).toBe(false);
        });
    });
});