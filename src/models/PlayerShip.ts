/**
 * @file PlayerShip.ts
 * @description Player ship entity with movement capabilities for Space Invaders game
 */

import { Entity } from './Entity';

/**
 * Interface defining movement configuration for the player ship
 */
interface MovementConfig {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  bounds: {
    left: number;
    right: number;
  };
}

/**
 * PlayerShip class representing the player-controlled ship
 * Handles movement mechanics and boundaries
 */
export class PlayerShip extends Entity {
  private readonly config: MovementConfig;
  private velocity: number;
  private isMovingLeft: boolean;
  private isMovingRight: boolean;

  /**
   * Creates a new PlayerShip instance
   * @param x - Initial x position
   * @param y - Initial y position
   * @param width - Ship width
   * @param height - Ship height
   */
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    config: Partial<MovementConfig> = {}
  ) {
    super(x, y, width, height);

    // Default configuration with reasonable values
    this.config = {
      maxSpeed: 400, // pixels per second
      acceleration: 1200,
      deceleration: 800,
      bounds: {
        left: 0,
        right: 800, // default game width
      },
      ...config
    };

    this.velocity = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  /**
   * Updates the ship's movement state
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public update(deltaTime: number): void {
    this.updateVelocity(deltaTime);
    this.updatePosition(deltaTime);
    this.enforceBoundaries();
  }

  /**
   * Starts moving the ship left
   */
  public startMovingLeft(): void {
    this.isMovingLeft = true;
    this.isMovingRight = false;
  }

  /**
   * Starts moving the ship right
   */
  public startMovingRight(): void {
    this.isMovingRight = true;
    this.isMovingLeft = false;
  }

  /**
   * Stops the ship's movement
   */
  public stopMoving(): void {
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  /**
   * Gets the current velocity of the ship
   */
  public getVelocity(): number {
    return this.velocity;
  }

  /**
   * Updates the ship's velocity based on movement state
   */
  private updateVelocity(deltaTime: number): void {
    if (this.isMovingLeft) {
      this.velocity = Math.max(
        -this.config.maxSpeed,
        this.velocity - this.config.acceleration * deltaTime
      );
    } else if (this.isMovingRight) {
      this.velocity = Math.min(
        this.config.maxSpeed,
        this.velocity + this.config.acceleration * deltaTime
      );
    } else {
      // Apply deceleration when not moving
      if (this.velocity > 0) {
        this.velocity = Math.max(
          0,
          this.velocity - this.config.deceleration * deltaTime
        );
      } else if (this.velocity < 0) {
        this.velocity = Math.min(
          0,
          this.velocity + this.config.deceleration * deltaTime
        );
      }
    }
  }

  /**
   * Updates the ship's position based on current velocity
   */
  private updatePosition(deltaTime: number): void {
    this.x += this.velocity * deltaTime;
  }

  /**
   * Ensures the ship stays within the defined boundaries
   */
  private enforceBoundaries(): void {
    if (this.x < this.config.bounds.left) {
      this.x = this.config.bounds.left;
      this.velocity = 0;
    } else if (this.x + this.width > this.config.bounds.right) {
      this.x = this.config.bounds.right - this.width;
      this.velocity = 0;
    }
  }

  /**
   * Sets new movement boundaries for the ship
   */
  public setBoundaries(left: number, right: number): void {
    this.config.bounds.left = left;
    this.config.bounds.right = right;
  }
}