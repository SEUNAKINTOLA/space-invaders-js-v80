/**
 * @file MovementSystem.ts
 * @description Handles movement logic for game entities, particularly the player ship
 */

/**
 * Interface defining movement properties for entities
 */
interface MovementProperties {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    bounds?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
}

/**
 * Represents an entity that can be moved
 */
interface Moveable {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    speed: number;
    width: number;
    height: number;
}

/**
 * System responsible for handling movement of game entities
 */
export class MovementSystem {
    private readonly entities: Map<string, Moveable>;
    private readonly screenBounds: { width: number; height: number };

    /**
     * Creates a new MovementSystem instance
     * @param screenWidth - Width of the game screen
     * @param screenHeight - Height of the game screen
     */
    constructor(screenWidth: number, screenHeight: number) {
        this.entities = new Map();
        this.screenBounds = {
            width: screenWidth,
            height: screenHeight
        };
    }

    /**
     * Registers an entity to be managed by the movement system
     * @param id - Unique identifier for the entity
     * @param entity - The entity to register
     */
    public registerEntity(id: string, entity: Moveable): void {
        if (!entity) {
            throw new Error('Cannot register null or undefined entity');
        }
        this.entities.set(id, entity);
    }

    /**
     * Unregisters an entity from the movement system
     * @param id - ID of the entity to unregister
     */
    public unregisterEntity(id: string): void {
        this.entities.delete(id);
    }

    /**
     * Updates the position of all registered entities based on their velocity
     * @param deltaTime - Time elapsed since last update in seconds
     */
    public update(deltaTime: number): void {
        this.entities.forEach((entity) => {
            this.updateEntityPosition(entity, deltaTime);
        });
    }

    /**
     * Sets the velocity for a specific entity
     * @param id - ID of the entity
     * @param velocityX - Horizontal velocity
     * @param velocityY - Vertical velocity
     */
    public setVelocity(id: string, velocityX: number, velocityY: number): void {
        const entity = this.entities.get(id);
        if (entity) {
            entity.velocity.x = velocityX * entity.speed;
            entity.velocity.y = velocityY * entity.speed;
        }
    }

    /**
     * Gets the current position of an entity
     * @param id - ID of the entity
     * @returns Current position or null if entity not found
     */
    public getPosition(id: string): { x: number; y: number } | null {
        const entity = this.entities.get(id);
        return entity ? { x: entity.position.x, y: entity.position.y } : null;
    }

    /**
     * Updates the position of a single entity
     * @param entity - Entity to update
     * @param deltaTime - Time elapsed since last update
     */
    private updateEntityPosition(entity: Moveable, deltaTime: number): void {
        // Calculate new position
        const newX = entity.position.x + entity.velocity.x * deltaTime;
        const newY = entity.position.y + entity.velocity.y * deltaTime;

        // Apply screen bounds constraints
        entity.position.x = this.clamp(
            newX,
            0,
            this.screenBounds.width - entity.width
        );
        entity.position.y = this.clamp(
            newY,
            0,
            this.screenBounds.height - entity.height
        );
    }

    /**
     * Clamps a value between a minimum and maximum
     * @param value - Value to clamp
     * @param min - Minimum allowed value
     * @param max - Maximum allowed value
     * @returns Clamped value
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Resets the movement system, clearing all registered entities
     */
    public reset(): void {
        this.entities.clear();
    }

    /**
     * Gets the number of entities currently registered
     * @returns Number of registered entities
     */
    public get entityCount(): number {
        return this.entities.size;
    }
}