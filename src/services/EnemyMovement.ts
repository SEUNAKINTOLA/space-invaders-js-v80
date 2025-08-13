/**
 * @file EnemyMovement.ts
 * @description Implements various movement patterns for enemy entities in Space Invaders
 */

/**
 * Represents a 2D vector for position and movement
 */
interface Vector2D {
    x: number;
    y: number;
}

/**
 * Defines the movement pattern configuration
 */
interface MovementConfig {
    speed: number;
    amplitude?: number;
    frequency?: number;
    boundaryLeft?: number;
    boundaryRight?: number;
    boundaryBottom?: number;
}

/**
 * Enum defining available movement pattern types
 */
export enum MovementPattern {
    LINEAR_HORIZONTAL = 'LINEAR_HORIZONTAL',
    SINE_WAVE = 'SINE_WAVE',
    ZIGZAG = 'ZIGZAG',
    DIVE_BOMB = 'DIVE_BOMB',
    CIRCULAR = 'CIRCULAR'
}

/**
 * Class responsible for managing enemy movement patterns
 */
export class EnemyMovement {
    private startPosition: Vector2D;
    private currentPosition: Vector2D;
    private pattern: MovementPattern;
    private config: MovementConfig;
    private time: number;
    private direction: number;

    /**
     * Creates a new EnemyMovement instance
     * @param startX - Initial X position
     * @param startY - Initial Y position
     * @param pattern - Movement pattern to use
     * @param config - Movement configuration
     */
    constructor(
        startX: number,
        startY: number,
        pattern: MovementPattern,
        config: MovementConfig
    ) {
        this.startPosition = { x: startX, y: startY };
        this.currentPosition = { x: startX, y: startY };
        this.pattern = pattern;
        this.config = {
            speed: config.speed || 1,
            amplitude: config.amplitude || 50,
            frequency: config.frequency || 0.02,
            boundaryLeft: config.boundaryLeft || 0,
            boundaryRight: config.boundaryRight || 800,
            boundaryBottom: config.boundaryBottom || 600
        };
        this.time = 0;
        this.direction = 1;
    }

    /**
     * Updates the enemy position based on the selected movement pattern
     * @param deltaTime - Time elapsed since last update
     * @returns Updated position
     */
    public update(deltaTime: number): Vector2D {
        this.time += deltaTime;

        switch (this.pattern) {
            case MovementPattern.LINEAR_HORIZONTAL:
                this.updateLinearHorizontal(deltaTime);
                break;
            case MovementPattern.SINE_WAVE:
                this.updateSineWave(deltaTime);
                break;
            case MovementPattern.ZIGZAG:
                this.updateZigZag(deltaTime);
                break;
            case MovementPattern.DIVE_BOMB:
                this.updateDiveBomb(deltaTime);
                break;
            case MovementPattern.CIRCULAR:
                this.updateCircular(deltaTime);
                break;
            default:
                throw new Error(`Unknown movement pattern: ${this.pattern}`);
        }

        return this.currentPosition;
    }

    /**
     * Implements horizontal back-and-forth movement
     */
    private updateLinearHorizontal(deltaTime: number): void {
        this.currentPosition.x += this.config.speed * this.direction * deltaTime;

        if (this.currentPosition.x >= this.config.boundaryRight!) {
            this.direction = -1;
            this.currentPosition.x = this.config.boundaryRight!;
        } else if (this.currentPosition.x <= this.config.boundaryLeft!) {
            this.direction = 1;
            this.currentPosition.x = this.config.boundaryLeft!;
        }
    }

    /**
     * Implements sine wave movement pattern
     */
    private updateSineWave(deltaTime: number): void {
        this.currentPosition.x = this.startPosition.x + 
            Math.sin(this.time * this.config.frequency!) * this.config.amplitude!;
        this.currentPosition.y = this.startPosition.y + 
            (this.config.speed * this.time);
    }

    /**
     * Implements zigzag movement pattern
     */
    private updateZigZag(deltaTime: number): void {
        const zigzagPeriod = 2000; // milliseconds
        const phase = (this.time % zigzagPeriod) / zigzagPeriod;
        
        this.currentPosition.x = this.startPosition.x + 
            (phase < 0.5 ? phase * 2 : (1 - phase) * 2) * this.config.amplitude!;
        this.currentPosition.y = this.startPosition.y + 
            (this.config.speed * this.time);
    }

    /**
     * Implements dive bomb movement pattern
     */
    private updateDiveBomb(deltaTime: number): void {
        const acceleration = 0.2;
        this.currentPosition.y += this.config.speed * 
            (1 + this.time * acceleration) * deltaTime;

        if (this.currentPosition.y > this.config.boundaryBottom!) {
            this.currentPosition.y = this.startPosition.y;
            this.time = 0;
        }
    }

    /**
     * Implements circular movement pattern
     */
    private updateCircular(deltaTime: number): void {
        const angle = this.time * this.config.frequency!;
        this.currentPosition.x = this.startPosition.x + 
            Math.cos(angle) * this.config.amplitude!;
        this.currentPosition.y = this.startPosition.y + 
            Math.sin(angle) * this.config.amplitude!;
    }

    /**
     * Gets the current position
     * @returns Current position vector
     */
    public getPosition(): Vector2D {
        return { ...this.currentPosition };
    }

    /**
     * Resets the movement to initial state
     */
    public reset(): void {
        this.currentPosition = { ...this.startPosition };
        this.time = 0;
        this.direction = 1;
    }
}