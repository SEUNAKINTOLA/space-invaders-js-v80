/**
 * Enemy.ts
 * Represents a base enemy entity in the Space Invaders game.
 */

/**
 * Enum representing different types of enemies
 */
export enum EnemyType {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
    BOSS = 'BOSS'
}

/**
 * Interface defining the properties for enemy initialization
 */
export interface EnemyConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    type: EnemyType;
    pointValue: number;
    speed: number;
    health: number;
}

/**
 * Base Enemy class representing enemy entities in the game
 */
export class Enemy {
    private readonly id: string;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private type: EnemyType;
    private pointValue: number;
    private speed: number;
    private health: number;
    private isActive: boolean;
    private direction: number; // 1 for right, -1 for left

    /**
     * Creates a new Enemy instance
     * @param config - Configuration object for enemy initialization
     */
    constructor(config: EnemyConfig) {
        this.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.type = config.type;
        this.pointValue = config.pointValue;
        this.speed = config.speed;
        this.health = config.health;
        this.isActive = true;
        this.direction = 1;
    }

    /**
     * Updates the enemy's position based on current direction and speed
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        if (!this.isActive) return;
        this.x += this.speed * this.direction * deltaTime;
    }

    /**
     * Changes the enemy's movement direction and moves them down
     * @param dropDistance - Distance to drop downward
     */
    public changeDirection(dropDistance: number): void {
        this.direction *= -1;
        this.y += dropDistance;
    }

    /**
     * Applies damage to the enemy
     * @param amount - Amount of damage to apply
     * @returns boolean indicating if the enemy was destroyed
     */
    public takeDamage(amount: number): boolean {
        this.health -= amount;
        if (this.health <= 0) {
            this.isActive = false;
            return true;
        }
        return false;
    }

    /**
     * Deactivates the enemy
     */
    public destroy(): void {
        this.isActive = false;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }

    public getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    public getType(): EnemyType {
        return this.type;
    }

    public getPointValue(): number {
        return this.pointValue;
    }

    public isAlive(): boolean {
        return this.isActive;
    }

    public getHealth(): number {
        return this.health;
    }

    public getBoundingBox(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    } {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // Setters
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }
}