/**
 * Physics.ts
 * Handles physics calculations, collision detection, and movement for game entities
 * in the Space Invaders game.
 */

// Types for physics calculations
interface Vector2D {
    x: number;
    y: number;
}

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Manages physics calculations and collision detection for game entities
 */
export class Physics {
    private readonly gravity: number = 0; // Space Invaders doesn't use gravity
    private readonly maxVelocity: number = 1000; // Maximum velocity cap
    
    /**
     * Creates a new Physics instance
     * @param worldBounds The boundaries of the game world
     */
    constructor(private readonly worldBounds: Bounds) {}

    /**
     * Updates position based on velocity and time
     * @param position Current position
     * @param velocity Current velocity
     * @param deltaTime Time since last update in seconds
     * @returns New position
     */
    public updatePosition(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
        return {
            x: this.clamp(
                position.x + velocity.x * deltaTime,
                0,
                this.worldBounds.width
            ),
            y: this.clamp(
                position.y + velocity.y * deltaTime,
                0,
                this.worldBounds.height
            )
        };
    }

    /**
     * Checks if two rectangular bounds intersect (collision detection)
     * @param bounds1 First entity bounds
     * @param bounds2 Second entity bounds
     * @returns True if collision detected
     */
    public checkCollision(bounds1: Bounds, bounds2: Bounds): boolean {
        return (
            bounds1.x < bounds2.x + bounds2.width &&
            bounds1.x + bounds1.width > bounds2.x &&
            bounds1.y < bounds2.y + bounds2.height &&
            bounds1.y + bounds1.height > bounds2.y
        );
    }

    /**
     * Calculates new velocity based on acceleration
     * @param velocity Current velocity
     * @param acceleration Acceleration vector
     * @param deltaTime Time since last update in seconds
     * @returns New velocity
     */
    public calculateVelocity(
        velocity: Vector2D,
        acceleration: Vector2D,
        deltaTime: number
    ): Vector2D {
        const newVelocity = {
            x: this.clamp(
                velocity.x + acceleration.x * deltaTime,
                -this.maxVelocity,
                this.maxVelocity
            ),
            y: this.clamp(
                velocity.y + acceleration.y * deltaTime,
                -this.maxVelocity,
                this.maxVelocity
            )
        };

        return newVelocity;
    }

    /**
     * Checks if a point is within the world bounds
     * @param position Position to check
     * @returns True if position is within bounds
     */
    public isInBounds(position: Vector2D): boolean {
        return (
            position.x >= 0 &&
            position.x <= this.worldBounds.width &&
            position.y >= 0 &&
            position.y <= this.worldBounds.height
        );
    }

    /**
     * Projects future position based on current motion
     * @param position Current position
     * @param velocity Current velocity
     * @param timeAhead Time to project ahead
     * @returns Projected position
     */
    public projectPosition(
        position: Vector2D,
        velocity: Vector2D,
        timeAhead: number
    ): Vector2D {
        return {
            x: position.x + velocity.x * timeAhead,
            y: position.y + velocity.y * timeAhead
        };
    }

    /**
     * Clamps a number between a minimum and maximum value
     * @param value Value to clamp
     * @param min Minimum allowed value
     * @param max Maximum allowed value
     * @returns Clamped value
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Calculates distance between two points
     * @param point1 First point
     * @param point2 Second point
     * @returns Distance between points
     */
    public calculateDistance(point1: Vector2D, point2: Vector2D): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Creates a new bounds object
     * @param x X coordinate
     * @param y Y coordinate
     * @param width Width of bounds
     * @param height Height of bounds
     * @returns New bounds object
     */
    public createBounds(x: number, y: number, width: number, height: number): Bounds {
        return { x, y, width, height };
    }
}

// Export interfaces for use in other modules
export type { Vector2D, Bounds };