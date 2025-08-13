/**
 * Represents a projectile entity in the game.
 * This class handles the core properties and behavior of projectiles,
 * such as bullets fired by the player or enemies.
 */
export class Projectile {
    private _id: string;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _speed: number;
    private _direction: number;
    private _active: boolean;
    private _owner: string;

    /**
     * Creates a new Projectile instance
     * @param x - Initial X coordinate
     * @param y - Initial Y coordinate
     * @param speed - Movement speed of the projectile
     * @param direction - Direction of movement (1 for down, -1 for up)
     * @param owner - ID of the entity that fired the projectile
     */
    constructor(
        x: number,
        y: number,
        speed: number = 5,
        direction: number = -1,
        owner: string = 'player'
    ) {
        this._id = crypto.randomUUID();
        this._x = x;
        this._y = y;
        this._width = 2;  // Default width for projectiles
        this._height = 8; // Default height for projectiles
        this._speed = speed;
        this._direction = direction;
        this._active = true;
        this._owner = owner;
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get speed(): number {
        return this._speed;
    }

    get direction(): number {
        return this._direction;
    }

    get active(): boolean {
        return this._active;
    }

    get owner(): string {
        return this._owner;
    }

    // Setters
    set x(value: number) {
        this._x = value;
    }

    set y(value: number) {
        this._y = value;
    }

    set active(value: boolean) {
        this._active = value;
    }

    /**
     * Updates the projectile's position based on its speed and direction
     * @param deltaTime - Time elapsed since last update in milliseconds
     */
    update(deltaTime: number): void {
        this._y += this._speed * this._direction * (deltaTime / 1000);
    }

    /**
     * Deactivates the projectile, making it available for reuse in the projectile pool
     */
    deactivate(): void {
        this._active = false;
    }

    /**
     * Resets the projectile's properties for reuse
     * @param x - New X coordinate
     * @param y - New Y coordinate
     * @param direction - New direction
     * @param owner - New owner ID
     */
    reset(x: number, y: number, direction: number = -1, owner: string = 'player'): void {
        this._x = x;
        this._y = y;
        this._direction = direction;
        this._owner = owner;
        this._active = true;
    }

    /**
     * Checks if the projectile is within the game boundaries
     * @param minY - Minimum Y coordinate
     * @param maxY - Maximum Y coordinate
     * @returns boolean indicating if the projectile is within bounds
     */
    isInBounds(minY: number, maxY: number): boolean {
        return this._y >= minY && this._y <= maxY;
    }

    /**
     * Returns a bounding box for collision detection
     * @returns Object containing position and dimensions
     */
    getBoundingBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height
        };
    }
}