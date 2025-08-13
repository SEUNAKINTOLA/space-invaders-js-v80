import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ShootingSystem } from '../../src/systems/ShootingSystem';
import { Entity } from '../../src/models/Entity';
import { ProjectilePool } from '../../src/services/ProjectilePool';
import { GameState } from '../../src/state/GameState';

// Mock dependencies
jest.mock('../../src/services/ProjectilePool');
jest.mock('../../src/state/GameState');
jest.mock('../../src/models/Entity');

describe('ShootingSystem', () => {
    let shootingSystem: ShootingSystem;
    let projectilePool: jest.Mocked<ProjectilePool>;
    let gameState: jest.Mocked<GameState>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Initialize mocked dependencies
        projectilePool = new ProjectilePool() as jest.Mocked<ProjectilePool>;
        gameState = new GameState() as jest.Mocked<GameState>;

        // Create shooting system instance
        shootingSystem = new ShootingSystem(projectilePool, gameState);
    });

    describe('update', () => {
        test('should process shooting for entities with shooting components', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = 16; // Simulate 60fps

            mockEntity.hasComponent = jest.fn().mockReturnValue(true);
            mockEntity.getComponent = jest.fn().mockReturnValue({
                cooldown: 0,
                lastShot: 0,
                projectileSpeed: 5,
                fireRate: 0.5
            });

            // Act
            shootingSystem.update(entities, deltaTime);

            // Assert
            expect(mockEntity.hasComponent).toHaveBeenCalledWith('shooting');
            expect(mockEntity.getComponent).toHaveBeenCalledWith('shooting');
            expect(projectilePool.spawn).toHaveBeenCalled();
        });

        test('should not shoot if entity is on cooldown', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = 16;

            mockEntity.hasComponent = jest.fn().mockReturnValue(true);
            mockEntity.getComponent = jest.fn().mockReturnValue({
                cooldown: 1000, // Still on cooldown
                lastShot: Date.now(),
                projectileSpeed: 5,
                fireRate: 0.5
            });

            // Act
            shootingSystem.update(entities, deltaTime);

            // Assert
            expect(projectilePool.spawn).not.toHaveBeenCalled();
        });

        test('should handle multiple shooting entities', () => {
            // Arrange
            const entity1 = new Entity();
            const entity2 = new Entity();
            const entities = [entity1, entity2];
            const deltaTime = 16;

            entity1.hasComponent = jest.fn().mockReturnValue(true);
            entity2.hasComponent = jest.fn().mockReturnValue(true);

            entity1.getComponent = jest.fn().mockReturnValue({
                cooldown: 0,
                lastShot: 0,
                projectileSpeed: 5,
                fireRate: 0.5
            });

            entity2.getComponent = jest.fn().mockReturnValue({
                cooldown: 0,
                lastShot: 0,
                projectileSpeed: 5,
                fireRate: 0.5
            });

            // Act
            shootingSystem.update(entities, deltaTime);

            // Assert
            expect(projectilePool.spawn).toHaveBeenCalledTimes(2);
        });

        test('should update cooldown after shooting', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = 16;
            const now = Date.now();
            jest.spyOn(Date, 'now').mockReturnValue(now);

            const shootingComponent = {
                cooldown: 0,
                lastShot: 0,
                projectileSpeed: 5,
                fireRate: 0.5
            };

            mockEntity.hasComponent = jest.fn().mockReturnValue(true);
            mockEntity.getComponent = jest.fn().mockReturnValue(shootingComponent);

            // Act
            shootingSystem.update(entities, deltaTime);

            // Assert
            expect(shootingComponent.lastShot).toBe(now);
            expect(shootingComponent.cooldown).toBe(1000 / shootingComponent.fireRate);
        });

        test('should not process entities without shooting component', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = 16;

            mockEntity.hasComponent = jest.fn().mockReturnValue(false);

            // Act
            shootingSystem.update(entities, deltaTime);

            // Assert
            expect(mockEntity.getComponent).not.toHaveBeenCalled();
            expect(projectilePool.spawn).not.toHaveBeenCalled();
        });
    });

    describe('initialization', () => {
        test('should properly initialize with dependencies', () => {
            // Assert
            expect(shootingSystem).toBeDefined();
            expect(shootingSystem['projectilePool']).toBe(projectilePool);
            expect(shootingSystem['gameState']).toBe(gameState);
        });
    });

    describe('error handling', () => {
        test('should handle undefined entity components gracefully', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = 16;

            mockEntity.hasComponent = jest.fn().mockReturnValue(true);
            mockEntity.getComponent = jest.fn().mockReturnValue(undefined);

            // Act & Assert
            expect(() => shootingSystem.update(entities, deltaTime)).not.toThrow();
        });

        test('should handle negative deltaTime', () => {
            // Arrange
            const mockEntity = new Entity();
            const entities = [mockEntity];
            const deltaTime = -16;

            mockEntity.hasComponent = jest.fn().mockReturnValue(true);
            mockEntity.getComponent = jest.fn().mockReturnValue({
                cooldown: 0,
                lastShot: 0,
                projectileSpeed: 5,
                fireRate: 0.5
            });

            // Act & Assert
            expect(() => shootingSystem.update(entities, deltaTime)).not.toThrow();
        });
    });
});