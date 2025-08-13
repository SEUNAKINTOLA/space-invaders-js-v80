/**
 * @file Player.ts
 * @description Defines the Player entity model for Space Invaders game
 */

/**
 * Represents the possible movement directions for the player
 */
export enum PlayerMovementDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

/**
 * Interface defining the base properties for player configuration
 */
export interface PlayerConfig {
  initialX: number;
  initialY: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
  maxLives: number;
}

/**
 * Represents the player entity in the Space Invaders game
 */
export class Player {
  private x: number;
  private y: number;
  private readonly width: number;
  private readonly height: number;
  private readonly speed: number;
  private lives: number;
  private readonly maxLives: number;
  private currentDirection: PlayerMovementDirection;
  private score: number;
  private isAlive: boolean;

  /**
   * Creates a new Player instance
   * @param config - Configuration object for player initialization
   */
  constructor(config: PlayerConfig) {
    this.validateConfig(config);
    
    this.x = config.initialX;
    this.y = config.initialY;
    this.width = config.width;
    this.height = config.height;
    this.speed = config.speed;
    this.lives = config.lives;
    this.maxLives = config.maxLives;
    this.currentDirection = PlayerMovementDirection.NONE;
    this.score = 0;
    this.isAlive = true;
  }

  /**
   * Validates the player configuration
   * @param config - Configuration object to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: PlayerConfig): void {
    if (config.initialX < 0 || config.initialY < 0) {
      throw new Error('Initial position must be non-negative');
    }
    if (config.width <= 0 || config.height <= 0) {
      throw new Error('Dimensions must be positive');
    }
    if (config.speed <= 0) {
      throw new Error('Speed must be positive');
    }
    if (config.lives <= 0 || config.maxLives <= 0) {
      throw new Error('Lives must be positive');
    }
    if (config.lives > config.maxLives) {
      throw new Error('Initial lives cannot exceed maximum lives');
    }
  }

  /**
   * Updates the player's position based on current direction and delta time
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    const movement = this.speed * (deltaTime / 1000);
    
    switch (this.currentDirection) {
      case PlayerMovementDirection.LEFT:
        this.x = Math.max(0, this.x - movement);
        break;
      case PlayerMovementDirection.RIGHT:
        // Assuming game width is handled by game boundaries later
        this.x += movement;
        break;
      default:
        break;
    }
  }

  /**
   * Sets the movement direction of the player
   * @param direction - New movement direction
   */
  public setDirection(direction: PlayerMovementDirection): void {
    this.currentDirection = direction;
  }

  /**
   * Handles player taking damage
   * @returns boolean indicating if the player is still alive
   */
  public takeDamage(): boolean {
    this.lives = Math.max(0, this.lives - 1);
    this.isAlive = this.lives > 0;
    return this.isAlive;
  }

  /**
   * Adds points to the player's score
   * @param points - Points to add
   */
  public addScore(points: number): void {
    if (points < 0) return;
    this.score += points;
  }

  /**
   * Adds an extra life to the player if below max lives
   * @returns boolean indicating if life was added
   */
  public addLife(): boolean {
    if (this.lives < this.maxLives) {
      this.lives++;
      return true;
    }
    return false;
  }

  // Getters
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  public getLives(): number {
    return this.lives;
  }

  public getScore(): number {
    return this.score;
  }

  public isPlayerAlive(): boolean {
    return this.isAlive;
  }

  /**
   * Resets the player to initial state
   * @param config - Optional new configuration for reset
   */
  public reset(config?: Partial<PlayerConfig>): void {
    this.x = config?.initialX ?? this.x;
    this.y = config?.initialY ?? this.y;
    this.lives = config?.lives ?? this.maxLives;
    this.score = 0;
    this.isAlive = true;
    this.currentDirection = PlayerMovementDirection.NONE;
  }
}