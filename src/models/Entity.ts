/**
 * Represents the position of an entity in 2D space.
 */
interface Position {
    x: number;
    y: number;
}

/**
 * Represents the dimensions of an entity.
 */
interface Dimensions {
    width: number;
    height: number;
}

/**
 * Represents the velocity of an entity.
 */
interface Velocity {
    dx: number;
    dy: number;
}

/**
 * Base class for all game entities in Space Invaders.
 * Provides common properties and methods that all game objects will inherit.
 */
export abstract class Entity {
    private _id: string;
    private _position: Position;
    private _dimensions: Dimensions;
    private _velocity: Velocity;
    private _active: boolean;
    private _visible: boolean;

    /**
     * Creates a new Entity instance.
     * @param x - Initial x coordinate
     * @param y - Initial y coordinate
     * @param width - Entity width
     * @param height - Entity height
     */
    constructor(x: number, y: number, width: number, height: number) {
        this._id = this.generateId();
        this._position = { x, y };
        this._dimensions = { width, height };
        this._velocity = { dx: 0, dy: 0 };
        this._active = true;
        this._visible = true;
    }

    /**
     * Generates a unique identifier for the entity.
     * @returns A unique string identifier
     */
    private generateId(): string {
        return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Updates the entity's state.
     * Should be implemented by derived classes.
     * @param deltaTime - Time elapsed since last update in milliseconds
     */
    abstract update(deltaTime: number): void;

    /**
     * Checks if this entity collides with another entity.
     * @param other - The other entity to check collision with
     * @returns True if entities collide, false otherwise
     */
    public checkCollision(other: Entity): boolean {
        return (
            this._position.x < other._position.x + other._dimensions.width &&
            this._position.x + this._dimensions.width > other._position.x &&
            this._position.y < other._position.y + other._dimensions.height &&
            this._position.y + this._dimensions.height > other._position.y
        );
    }

    /**
     * Moves the entity by its current velocity.
     * @param deltaTime - Time elapsed since last update in milliseconds
     */
    protected move(deltaTime: number): void {
        this._position.x += this._velocity.dx * deltaTime;
        this._position.y += this._velocity.dy * deltaTime;
    }

    // Getters and setters

    get id(): string {
        return this._id;
    }

    get position(): Position {
        return { ...this._position };
    }

    set position(newPosition: Position) {
        this._position = { ...newPosition };
    }

    get dimensions(): Dimensions {
        return { ...this._dimensions };
    }

    set dimensions(newDimensions: Dimensions) {
        this._dimensions = { ...newDimensions };
    }

    get velocity(): Velocity {
        return { ...this._velocity };
    }

    set velocity(newVelocity: Velocity) {
        this._velocity = { ...newVelocity };
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
    }

    /**
     * Gets the bounding box of the entity.
     * @returns An object containing the bounds of the entity
     */
    public getBounds(): { top: number; right: number; bottom: number; left: number } {
        return {
            top: this._position.y,
            right: this._position.x + this._dimensions.width,
            bottom: this._position.y + this._dimensions.height,
            left: this._position.x
        };
    }

    /**
     * Deactivates the entity.
     */
    public deactivate(): void {
        this._active = false;
        this._visible = false;
    }

    /**
     * Resets the entity to its default state.
     * Should be implemented by derived classes if needed.
     */
    public reset(): void {
        this._active = true;
        this._visible = true;
        this._velocity = { dx: 0, dy: 0 };
    }
}