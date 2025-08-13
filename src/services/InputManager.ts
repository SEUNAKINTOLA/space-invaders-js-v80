/**
 * @file InputManager.ts
 * @description Manages keyboard and touch input events for the game
 */

export type InputKey = 'LEFT' | 'RIGHT' | 'SPACE' | 'ESCAPE' | 'ENTER';
export type TouchArea = 'LEFT' | 'RIGHT' | 'ACTION';

interface TouchRegion {
    x: number;
    y: number;
    width: number;
    height: number;
    area: TouchArea;
}

export class InputManager {
    private static instance: InputManager;
    
    private keyStates: Map<InputKey, boolean>;
    private touchStates: Map<TouchArea, boolean>;
    private touchRegions: TouchRegion[];
    private enabled: boolean;

    private constructor() {
        this.keyStates = new Map();
        this.touchStates = new Map();
        this.touchRegions = [];
        this.enabled = false;

        // Initialize all states to false
        this.initializeStates();
    }

    /**
     * Gets the singleton instance of InputManager
     */
    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    /**
     * Initializes the input manager and sets up event listeners
     */
    public initialize(): void {
        if (this.enabled) return;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        this.setupTouchRegions();
        this.enabled = true;
    }

    /**
     * Cleans up event listeners and resets states
     */
    public cleanup(): void {
        if (!this.enabled) return;

        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        window.removeEventListener('touchend', this.handleTouchEnd.bind(this));

        this.initializeStates();
        this.enabled = false;
    }

    /**
     * Checks if a specific key or touch area is currently pressed
     */
    public isPressed(input: InputKey | TouchArea): boolean {
        return this.keyStates.get(input as InputKey) || 
               this.touchStates.get(input as TouchArea) || 
               false;
    }

    /**
     * Updates touch regions based on screen size
     * @param canvasWidth Width of the game canvas
     * @param canvasHeight Height of the game canvas
     */
    public updateTouchRegions(canvasWidth: number, canvasHeight: number): void {
        this.touchRegions = [
            {
                x: 0,
                y: 0,
                width: canvasWidth / 3,
                height: canvasHeight,
                area: 'LEFT'
            },
            {
                x: canvasWidth * (2/3),
                y: 0,
                width: canvasWidth / 3,
                height: canvasHeight,
                area: 'RIGHT'
            },
            {
                x: canvasWidth / 3,
                y: canvasHeight / 2,
                width: canvasWidth / 3,
                height: canvasHeight / 2,
                area: 'ACTION'
            }
        ];
    }

    private initializeStates(): void {
        // Initialize keyboard states
        this.keyStates.clear();
        ['LEFT', 'RIGHT', 'SPACE', 'ESCAPE', 'ENTER'].forEach(key => {
            this.keyStates.set(key as InputKey, false);
        });

        // Initialize touch states
        this.touchStates.clear();
        ['LEFT', 'RIGHT', 'ACTION'].forEach(area => {
            this.touchStates.set(area as TouchArea, false);
        });
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const key = this.mapKeyToInput(event.code);
        if (key) {
            event.preventDefault();
            this.keyStates.set(key, true);
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        const key = this.mapKeyToInput(event.code);
        if (key) {
            event.preventDefault();
            this.keyStates.set(key, false);
        }
    }

    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault();
        Array.from(event.touches).forEach(touch => {
            const area = this.getTouchArea(touch.clientX, touch.clientY);
            if (area) {
                this.touchStates.set(area, true);
            }
        });
    }

    private handleTouchEnd(event: TouchEvent): void {
        event.preventDefault();
        this.touchStates.forEach((_, area) => {
            this.touchStates.set(area, false);
        });
    }

    private mapKeyToInput(keyCode: string): InputKey | null {
        const keyMap: { [key: string]: InputKey } = {
            'ArrowLeft': 'LEFT',
            'KeyA': 'LEFT',
            'ArrowRight': 'RIGHT',
            'KeyD': 'RIGHT',
            'Space': 'SPACE',
            'Escape': 'ESCAPE',
            'Enter': 'ENTER'
        };
        return keyMap[keyCode] || null;
    }

    private getTouchArea(x: number, y: number): TouchArea | null {
        for (const region of this.touchRegions) {
            if (x >= region.x && 
                x <= region.x + region.width && 
                y >= region.y && 
                y <= region.y + region.height) {
                return region.area;
            }
        }
        return null;
    }

    private setupTouchRegions(): void {
        // Default touch regions, should be updated with actual canvas size
        this.updateTouchRegions(window.innerWidth, window.innerHeight);
    }
}

export default InputManager;