/**
 * SpatialGrid.ts
 * A spatial partitioning system for efficient collision detection
 */

/**
 * Represents a cell in the spatial grid containing entities
 */
interface GridCell {
    entities: Set<Entity>;
}

/**
 * Represents an entity with position and dimensions for collision detection
 */
interface Entity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * SpatialGrid class handles spatial partitioning for efficient collision detection
 */
export class SpatialGrid {
    private cells: Map<string, GridCell>;
    private readonly cellSize: number;
    private readonly worldWidth: number;
    private readonly worldHeight: number;

    /**
     * Creates a new SpatialGrid instance
     * @param worldWidth - The total width of the game world
     * @param worldHeight - The total height of the game world
     * @param cellSize - The size of each grid cell (default: 100)
     */
    constructor(worldWidth: number, worldHeight: number, cellSize: number = 100) {
        this.cells = new Map<string, GridCell>();
        this.cellSize = cellSize;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    /**
     * Generates a unique key for a grid cell based on its coordinates
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @returns The cell key string
     */
    private getCellKey(x: number, y: number): string {
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        return `${gridX},${gridY}`;
    }

    /**
     * Gets or creates a cell at the specified coordinates
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @returns The grid cell
     */
    private getCell(x: number, y: number): GridCell {
        const key = this.getCellKey(x, y);
        if (!this.cells.has(key)) {
            this.cells.set(key, { entities: new Set() });
        }
        return this.cells.get(key)!;
    }

    /**
     * Inserts an entity into the spatial grid
     * @param entity - The entity to insert
     */
    public insertEntity(entity: Entity): void {
        const cellKeys = this.getCellsForEntity(entity);
        
        for (const key of cellKeys) {
            if (!this.cells.has(key)) {
                this.cells.set(key, { entities: new Set() });
            }
            this.cells.get(key)!.entities.add(entity);
        }
    }

    /**
     * Removes an entity from the spatial grid
     * @param entity - The entity to remove
     */
    public removeEntity(entity: Entity): void {
        const cellKeys = this.getCellsForEntity(entity);
        
        for (const key of cellKeys) {
            const cell = this.cells.get(key);
            if (cell) {
                cell.entities.delete(entity);
                if (cell.entities.size === 0) {
                    this.cells.delete(key);
                }
            }
        }
    }

    /**
     * Updates an entity's position in the spatial grid
     * @param entity - The entity to update
     * @param oldX - The previous x coordinate
     * @param oldY - The previous y coordinate
     */
    public updateEntity(entity: Entity, oldX: number, oldY: number): void {
        const oldKeys = this.getCellsForEntityAtPosition(entity, oldX, oldY);
        const newKeys = this.getCellsForEntity(entity);

        // Remove from old cells that are no longer occupied
        for (const key of oldKeys) {
            if (!newKeys.includes(key)) {
                const cell = this.cells.get(key);
                if (cell) {
                    cell.entities.delete(entity);
                    if (cell.entities.size === 0) {
                        this.cells.delete(key);
                    }
                }
            }
        }

        // Add to new cells
        for (const key of newKeys) {
            if (!oldKeys.includes(key)) {
                if (!this.cells.has(key)) {
                    this.cells.set(key, { entities: new Set() });
                }
                this.cells.get(key)!.entities.add(entity);
            }
        }
    }

    /**
     * Gets all entities that could potentially collide with the given entity
     * @param entity - The entity to check
     * @returns Array of potential collision candidates
     */
    public getPotentialCollisions(entity: Entity): Entity[] {
        const cellKeys = this.getCellsForEntity(entity);
        const candidates = new Set<Entity>();

        for (const key of cellKeys) {
            const cell = this.cells.get(key);
            if (cell) {
                for (const other of cell.entities) {
                    if (other !== entity) {
                        candidates.add(other);
                    }
                }
            }
        }

        return Array.from(candidates);
    }

    /**
     * Gets all cell keys that an entity occupies
     * @param entity - The entity to check
     * @returns Array of cell keys
     */
    private getCellsForEntity(entity: Entity): string[] {
        return this.getCellsForEntityAtPosition(entity, entity.x, entity.y);
    }

    /**
     * Gets all cell keys that an entity would occupy at a specific position
     * @param entity - The entity to check
     * @param x - The x coordinate to check
     * @param y - The y coordinate to check
     * @returns Array of cell keys
     */
    private getCellsForEntityAtPosition(entity: Entity, x: number, y: number): string[] {
        const startX = Math.floor(x / this.cellSize);
        const startY = Math.floor(y / this.cellSize);
        const endX = Math.floor((x + entity.width) / this.cellSize);
        const endY = Math.floor((y + entity.height) / this.cellSize);

        const cells: string[] = [];
        for (let gridY = startY; gridY <= endY; gridY++) {
            for (let gridX = startX; gridX <= endX; gridX++) {
                cells.push(`${gridX},${gridY}`);
            }
        }
        return cells;
    }

    /**
     * Clears all entities from the spatial grid
     */
    public clear(): void {
        this.cells.clear();
    }

    /**
     * Gets the total number of cells in the grid
     * @returns The number of cells
     */
    public getCellCount(): number {
        return this.cells.size;
    }

    /**
     * Gets the total number of entities in the grid
     * @returns The number of entities
     */
    public getEntityCount(): number {
        let count = 0;
        for (const cell of this.cells.values()) {
            count += cell.entities.size;
        }
        return count;
    }
}