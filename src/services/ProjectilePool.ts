/**
 * @file ProjectilePool.ts
 * @description Manages a pool of reusable projectile objects for efficient memory usage
 */

import { Projectile } from '../models/Projectile';

export interface ProjectileConfig {
    maxSpeed: number;
    width: number;
    height: number;
    damage: number;
}

export class ProjectilePool {
    private readonly pool: Projectile[];
    private readonly maxSize: number;
    private readonly config: ProjectileConfig;
    private activeProjectiles: Set<Projectile>;

    /**
     * Creates a new ProjectilePool instance
     * @param maxSize Maximum number of projectiles that can exist simultaneously
     * @param config Configuration for projectile properties
     */
    constructor(maxSize: number, config: ProjectileConfig) {
        this.maxSize = maxSize;
        this.config = config;
        this.pool = [];
        this.activeProjectiles = new Set();
        this.initializePool();
    }

    /**
     * Initializes the pool with inactive projectiles
     * @private
     */
    private initializePool(): void {
        for (let i = 0; i < this.maxSize; i++) {
            this.pool.push(new Projectile({
                x: 0,
                y: 0,
                width: this.config.width,
                height: this.config.height,
                speed: this.config.maxSpeed,
                damage: this.config.damage,
                active: false
            }));
        }
    }

    /**
     * Acquires an inactive projectile from the pool
     * @param x Initial x position
     * @param y Initial y position
     * @param direction Direction vector for projectile movement
     * @returns Projectile instance or null if pool is exhausted
     */
    public acquire(x: number, y: number, direction: { x: number; y: number }): Projectile | null {
        const inactiveProjectile = this.pool.find(p => !p.isActive());
        
        if (!inactiveProjectile) {
            console.warn('Projectile pool exhausted');
            return null;
        }

        inactiveProjectile.reset({
            x,
            y,
            direction,
            active: true
        });

        this.activeProjectiles.add(inactiveProjectile);
        return inactiveProjectile;
    }

    /**
     * Returns a projectile to the pool
     * @param projectile Projectile to release
     */
    public release(projectile: Projectile): void {
        if (!this.activeProjectiles.has(projectile)) {
            console.warn('Attempting to release projectile not from this pool');
            return;
        }

        projectile.deactivate();
        this.activeProjectiles.delete(projectile);
    }

    /**
     * Updates all active projectiles
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        for (const projectile of this.activeProjectiles) {
            projectile.update(deltaTime);

            // Auto-release projectiles that are off-screen or inactive
            if (!projectile.isActive() || this.isOutOfBounds(projectile)) {
                this.release(projectile);
            }
        }
    }

    /**
     * Checks if a projectile is outside the game boundaries
     * @param projectile Projectile to check
     * @private
     */
    private isOutOfBounds(projectile: Projectile): boolean {
        // Assuming game boundaries, adjust as needed
        const SCREEN_WIDTH = 800;
        const SCREEN_HEIGHT = 600;

        return (
            projectile.x < 0 ||
            projectile.x > SCREEN_WIDTH ||
            projectile.y < 0 ||
            projectile.y > SCREEN_HEIGHT
        );
    }

    /**
     * Gets all currently active projectiles
     * @returns Array of active projectiles
     */
    public getActiveProjectiles(): Projectile[] {
        return Array.from(this.activeProjectiles);
    }

    /**
     * Clears all active projectiles
     */
    public clear(): void {
        for (const projectile of this.activeProjectiles) {
            this.release(projectile);
        }
    }

    /**
     * Gets the current number of active projectiles
     * @returns Number of active projectiles
     */
    public getActiveCount(): number {
        return this.activeProjectiles.size;
    }

    /**
     * Gets the maximum capacity of the pool
     * @returns Maximum number of projectiles
     */
    public getMaxSize(): number {
        return this.maxSize;
    }
}