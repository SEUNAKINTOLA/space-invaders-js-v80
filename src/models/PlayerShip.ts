/**
 * @file PlayerShip.ts
 * @description Represents the player's ship entity in the Space Invaders game.
 */

/**
 * Interface defining the configuration options for a PlayerShip
 */
interface PlayerShipConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    maxHealth?: number;
}

/**
 * Represents the player's ship in the game
 * Handles ship state, properties, and basic behaviors
 */
export class PlayerShip {
    private readonly width: number;
    private readonly height: number;
    private readonly speed: number;
    private readonly maxHealth: number;

    private position: { x: number; y: number };
    private health: number;
    private isAlive: boolean;
    private lastShotTime: number;
    private readonly shootCooldown: number = 250; // Milliseconds between shots

    /**
     * Creates a new PlayerShip instance
     * @param config - Configuration options for the player ship
     */
    constructor(config: PlayerShipConfig) {
        this.position = {
            x: config.x,
            y: config.y
        };
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.maxHealth = config.maxHealth || 100;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.lastShotTime = 0;
    }

    /**
     * Updates the ship's horizontal position
     * @param deltaX - The change in x position
     */
    public move(deltaX: number): void {
        this.position.x += deltaX * this.speed;
    }

    /**
     * Checks if the ship can fire based on cooldown
     * @returns boolean indicating if the ship can shoot
     */
    public canShoot(): boolean {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootCooldown) {
            this.lastShotTime = currentTime;
            return true;
        }
        return false;
    }

    /**
     * Applies damage to the ship
     * @param amount - Amount of damage to apply
     * @returns boolean indicating if the ship was destroyed
     */
    public takeDamage(amount: number): boolean {
        if (!this.isAlive) return false;

        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.isAlive = false;
            return true;
        }
        return false;
    }

    /**
     * Resets the ship to its initial state
     * @param position - Optional new position for the ship
     */
    public reset(position?: { x: number; y: number }): void {
        if (position) {
            this.position = { ...position };
        }
        this.health = this.maxHealth;
        this.isAlive = true;
        this.lastShotTime = 0;
    }

    // Getters
    public getPosition(): { x: number; y: number } {
        return { ...this.position };
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getHealth(): number {
        return this.health;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public isDestroyed(): boolean {
        return !this.isAlive;
    }

    /**
     * Gets the ship's bounding box for collision detection
     * @returns Object containing the ship's bounds
     */
    public getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }
}