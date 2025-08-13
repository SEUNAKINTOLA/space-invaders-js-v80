/**
 * @file Entity.ts
 * @description Base entity class for game objects in Space Invaders
 */

/**
 * Represents the possible entity types in the game
 */
export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  PROJECTILE = 'PROJECTILE',
  SHIELD = 'SHIELD'
}

/**
 * Vector2D interface for handling 2D positions and velocities
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Base entity class that provides common properties and methods
 * for all game objects
 */
export class Entity {
  private _id: string;
  private _type: EntityType;
  private _position: Vector2D;
  private _velocity: Vector2D;
  private _width: number;
  private _height: number;
  private _active: boolean;

  /**
   * Creates a new Entity instance
   * @param type - The type of entity
   * @param position - Initial position vector
   * @param width - Width of the entity
   * @param height - Height of the entity
   */
  constructor(
    type: EntityType,
    position: Vector2D,
    width: number,
    height: number
  ) {
    this._id = this.generateId();
    this._type = type;
    this._position = { ...position };
    this._velocity = { x: 0, y: 0 };
    this._width = width;
    this._height = height;
    this._active = true;
  }

  /**
   * Generates a unique identifier for the entity
   * @returns Unique string ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters and setters
  get id(): string {
    return this._id;
  }

  get type(): EntityType {
    return this._type;
  }

  get position(): Vector2D {
    return { ...this._position };
  }

  set position(newPosition: Vector2D) {
    this._position = { ...newPosition };
  }

  get velocity(): Vector2D {
    return { ...this._velocity };
  }

  set velocity(newVelocity: Vector2D) {
    this._velocity = { ...newVelocity };
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  /**
   * Gets the bounding box of the entity for collision detection
   * @returns Object containing bounds information
   */
  getBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this._position.x,
      right: this._position.x + this._width,
      top: this._position.y,
      bottom: this._position.y + this._height
    };
  }

  /**
   * Updates the entity's position based on its velocity
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    if (!this._active) return;

    this._position.x += this._velocity.x * deltaTime;
    this._position.y += this._velocity.y * deltaTime;
  }

  /**
   * Deactivates the entity
   */
  deactivate(): void {
    this._active = false;
  }

  /**
   * Activates the entity
   */
  activate(): void {
    this._active = true;
  }

  /**
   * Resets the entity to its initial state
   * @param position - New position for the entity
   */
  reset(position: Vector2D): void {
    this._position = { ...position };
    this._velocity = { x: 0, y: 0 };
    this._active = true;
  }
}