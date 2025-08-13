/**
 * @file Player.ts
 * @description Player class handling player entity behavior and audio feedback
 */

import { Vector2D } from '../types/Vector2D';
import { AudioManager } from '../audio/AudioManager';

export interface PlayerConfig {
    initialPosition: Vector2D;
    speed: number;
    size: Vector2D;
    lives: number;
}

/**
 * Represents the player entity in the game
 */
export class Player {
    private position: Vector2D;
    private velocity: Vector2D;
    private size: Vector2D;
    private speed: number;
    private lives: number;
    private isInvulnerable: boolean;
    private invulnerabilityTimer: number;
    private readonly audioManager: AudioManager;

    /**
     * Creates a new Player instance
     * @param config - Configuration object for player initialization
     * @param audioManager - Audio manager instance for sound effects
     */
    constructor(config: PlayerConfig, audioManager: AudioManager) {
        this.position = { ...config.initialPosition };
        this.velocity = { x: 0, y: 0 };
        this.size = { ...config.size };
        this.speed = config.speed;
        this.lives = config.lives;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.audioManager = audioManager;
    }

    /**
     * Updates player position and state
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        // Update position based on velocity
        this.position.x += this.velocity.x * this.speed * deltaTime;
        this.position.y += this.velocity.y * this.speed * deltaTime;

        // Update invulnerability state
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
            }
        }
    }

    /**
     * Handles player movement
     * @param direction - Movement direction vector
     */
    public move(direction: Vector2D): void {
        this.velocity = { ...direction };
        if (direction.x !== 0 || direction.y !== 0) {
            this.audioManager.playSoundEffect('playerMove');
        }
    }

    /**
     * Handles player shooting action
     * @returns Boolean indicating if shot was fired
     */
    public shoot(): boolean {
        this.audioManager.playSoundEffect('playerShoot');
        return true;
    }

    /**
     * Handles player taking damage
     * @returns Boolean indicating if damage was applied
     */
    public takeDamage(): boolean {
        if (this.isInvulnerable) return false;

        this.lives--;
        this.audioManager.playSoundEffect('playerHit');
        
        if (this.lives <= 0) {
            this.audioManager.playSoundEffect('playerDeath');
            return true;
        }

        // Set invulnerability period
        this.setInvulnerable(2000); // 2 seconds of invulnerability
        return false;
    }

    /**
     * Sets player invulnerability state
     * @param duration - Duration of invulnerability in milliseconds
     */
    private setInvulnerable(duration: number): void {
        this.isInvulnerable = true;
        this.invulnerabilityTimer = duration;
    }

    /**
     * Gets current player position
     * @returns Current position vector
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets current player size
     * @returns Current size vector
     */
    public getSize(): Vector2D {
        return { ...this.size };
    }

    /**
     * Gets current number of lives
     * @returns Number of remaining lives
     */
    public getLives(): number {
        return this.lives;
    }

    /**
     * Checks if player is currently invulnerable
     * @returns Invulnerability state
     */
    public isInvulnerableState(): boolean {
        return this.isInvulnerable;
    }
}