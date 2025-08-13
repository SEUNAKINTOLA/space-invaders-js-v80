/**
 * @file CollisionSystem.ts
 * @description Handles collision detection between game entities in the Space Invaders game.
 */

/**
 * Represents the dimensions and position of a collision box
 */
interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Represents an entity that can collide
 */
interface Collidable {
    id: string;
    type: string;
    getBoundingBox(): BoundingBox;
    isActive(): boolean;
}

/**
 * Represents a collision event between two entities
 */
interface CollisionEvent {
    entity1: Collidable;
    entity2: Collidable;
    timestamp: number;
}

/**
 * Handles collision detection and collision events between game entities
 */
export class CollisionSystem {
    private entities: Map<string, Collidable>;
    private collisionHandlers: Map<string, (event: CollisionEvent) => void>;

    constructor() {
        this.entities = new Map();
        this.collisionHandlers = new Map();
    }

    /**
     * Registers an entity for collision detection
     * @param entity The entity to register
     */
    public registerEntity(entity: Collidable): void {
        if (!entity.id) {
            throw new Error('Entity must have an id');
        }
        this.entities.set(entity.id, entity);
    }

    /**
     * Unregisters an entity from collision detection
     * @param entityId The ID of the entity to unregister
     */
    public unregisterEntity(entityId: string): void {
        this.entities.delete(entityId);
    }

    /**
     * Registers a collision handler for specific entity type combinations
     * @param type1 First entity type
     * @param type2 Second entity type
     * @param handler Callback function to handle the collision
     */
    public registerCollisionHandler(
        type1: string,
        type2: string,
        handler: (event: CollisionEvent) => void
    ): void {
        const key = this.getCollisionKey(type1, type2);
        this.collisionHandlers.set(key, handler);
    }

    /**
     * Updates the collision system and checks for collisions
     */
    public update(): void {
        const activeEntities = Array.from(this.entities.values())
            .filter(entity => entity.isActive());

        for (let i = 0; i < activeEntities.length; i++) {
            for (let j = i + 1; j < activeEntities.length; j++) {
                const entity1 = activeEntities[i];
                const entity2 = activeEntities[j];

                if (this.checkCollision(entity1, entity2)) {
                    this.handleCollision(entity1, entity2);
                }
            }
        }
    }

    /**
     * Checks if two entities are colliding using their bounding boxes
     * @param entity1 First entity
     * @param entity2 Second entity
     * @returns True if entities are colliding, false otherwise
     */
    private checkCollision(entity1: Collidable, entity2: Collidable): boolean {
        const box1 = entity1.getBoundingBox();
        const box2 = entity2.getBoundingBox();

        return (
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y
        );
    }

    /**
     * Handles a collision between two entities
     * @param entity1 First entity
     * @param entity2 Second entity
     */
    private handleCollision(entity1: Collidable, entity2: Collidable): void {
        const key1 = this.getCollisionKey(entity1.type, entity2.type);
        const key2 = this.getCollisionKey(entity2.type, entity1.type);

        const handler = this.collisionHandlers.get(key1) || this.collisionHandlers.get(key2);

        if (handler) {
            const event: CollisionEvent = {
                entity1,
                entity2,
                timestamp: Date.now()
            };

            handler(event);
        }
    }

    /**
     * Generates a unique key for collision handler mapping
     * @param type1 First entity type
     * @param type2 Second entity type
     * @returns Collision key string
     */
    private getCollisionKey(type1: string, type2: string): string {
        return `${type1}:${type2}`;
    }

    /**
     * Clears all registered entities and handlers
     */
    public clear(): void {
        this.entities.clear();
        this.collisionHandlers.clear();
    }

    /**
     * Gets the number of registered entities
     * @returns Number of entities
     */
    public getEntityCount(): number {
        return this.entities.size;
    }
}