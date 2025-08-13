/**
 * @file ShootingSystem.ts
 * @description Manages shooting mechanics for entities in the game
 */

import { Entity } from '../models/Entity';
import { Projectile } from '../models/Projectile';
import { ProjectilePool } from '../services/ProjectilePool';

export interface ShootingConfig {
    cooldownTime: number;      // Time between shots in milliseconds
    projectileSpeed: number;   // Speed of projectiles
    maxProjectiles: number;    // Maximum number of active projectiles
}

export class ShootingSystem {
    private projectilePool: ProjectilePool;
    private lastShotTime: Map<number, number>;  // Entity ID to last shot time mapping
    private config: ShootingConfig;

    /**
     * Creates a new ShootingSystem instance
     * @param config Configuration for shooting mechanics
     */
    constructor(config: ShootingConfig) {
        this.projectilePool = new ProjectilePool(config.maxProjectiles);
        this.lastShotTime = new Map<number, number>();
        this.config = {
            cooldownTime: config.cooldownTime || 250,
            projectileSpeed: config.projectileSpeed || 5,
            maxProjectiles: config.maxProjectiles || 10
        };
    }

    /**
     * Attempts to create a new projectile for the given entity
     * @param entity The entity attempting to shoot
     * @param currentTime Current game time in milliseconds
     * @returns The created projectile or null if shooting not possible
     */
    public shoot(entity: Entity, currentTime: number): Projectile | null {
        if (!this.canShoot(entity.id, currentTime)) {
            return null;
        }

        const projectile = this.projectilePool.acquire();
        if (!projectile) {
            return null;
        }

        this.initializeProjectile(projectile, entity);
        this.lastShotTime.set(entity.id, currentTime);

        return projectile;
    }

    /**
     * Updates all active projectiles
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    public update(deltaTime: number): void {
        const activeProjectiles = this.projectilePool.getActiveProjectiles();
        
        for (const projectile of activeProjectiles) {
            this.updateProjectile(projectile, deltaTime);
            
            if (this.isProjectileOutOfBounds(projectile)) {
                this.projectilePool.release(projectile);
            }
        }
    }

    /**
     * Checks if an entity can shoot based on cooldown
     * @param entityId ID of the entity attempting to shoot
     * @param currentTime Current game time in milliseconds
     * @returns Boolean indicating if shooting is allowed
     */
    private canShoot(entityId: number, currentTime: number): boolean {
        const lastShot = this.lastShotTime.get(entityId) || 0;
        return currentTime - lastShot >= this.config.cooldownTime;
    }

    /**
     * Initializes a projectile with position and velocity based on the shooting entity
     * @param projectile Projectile to initialize
     * @param entity Entity that is shooting
     */
    private initializeProjectile(projectile: Projectile, entity: Entity): void {
        projectile.x = entity.x;
        projectile.y = entity.y;
        projectile.velocity = {
            x: 0,
            y: -this.config.projectileSpeed // Negative Y means upward movement
        };
        projectile.active = true;
        projectile.ownerId = entity.id;
    }

    /**
     * Updates projectile position based on its velocity
     * @param projectile Projectile to update
     * @param deltaTime Time elapsed since last update
     */
    private updateProjectile(projectile: Projectile, deltaTime: number): void {
        projectile.x += projectile.velocity.x * (deltaTime / 1000);
        projectile.y += projectile.velocity.y * (deltaTime / 1000);
    }

    /**
     * Checks if a projectile is outside the game bounds
     * @param projectile Projectile to check
     * @returns Boolean indicating if projectile is out of bounds
     */
    private isProjectileOutOfBounds(projectile: Projectile): boolean {
        // These bounds should ideally come from game configuration
        const SCREEN_HEIGHT = 600; // Example value
        const SCREEN_WIDTH = 800;  // Example value
        
        return projectile.x < 0 ||
               projectile.x > SCREEN_WIDTH ||
               projectile.y < 0 ||
               projectile.y > SCREEN_HEIGHT;
    }

    /**
     * Cleans up all projectiles and resets the system
     */
    public reset(): void {
        this.projectilePool.reset();
        this.lastShotTime.clear();
    }

    /**
     * Gets all active projectiles
     * @returns Array of active projectiles
     */
    public getActiveProjectiles(): Projectile[] {
        return this.projectilePool.getActiveProjectiles();
    }
}