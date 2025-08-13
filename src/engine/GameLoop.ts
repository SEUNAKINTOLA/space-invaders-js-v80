/**
 * @file GameLoop.ts
 * @description Implements the main game loop and engine coordination for Space Invaders
 */

/**
 * Configuration interface for game loop settings
 */
interface GameLoopConfig {
    targetFPS: number;
    maxFrameTime: number;
    updateInterval: number;
}

/**
 * Represents a game subsystem that can be updated and rendered
 */
interface GameSystem {
    update(deltaTime: number): void;
    render?(): void;
}

/**
 * Main game loop class responsible for coordinating updates and rendering
 */
export class GameLoop {
    private isRunning: boolean = false;
    private lastFrameTime: number = 0;
    private accumulator: number = 0;
    private systems: GameSystem[] = [];
    private frameCount: number = 0;
    private fpsTimer: number = 0;
    private currentFPS: number = 0;

    private readonly config: GameLoopConfig = {
        targetFPS: 60,
        maxFrameTime: 1000 / 30, // Cap at 30 FPS minimum
        updateInterval: 1000 / 60  // 60 updates per second
    };

    /**
     * Creates a new GameLoop instance
     * @param config Optional configuration override
     */
    constructor(config?: Partial<GameLoopConfig>) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Adds a system to the game loop
     * @param system The game system to add
     */
    public addSystem(system: GameSystem): void {
        this.systems.push(system);
    }

    /**
     * Starts the game loop
     */
    public start(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.fpsTimer = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Stops the game loop
     */
    public stop(): void {
        this.isRunning = false;
    }

    /**
     * Returns the current FPS
     */
    public getFPS(): number {
        return this.currentFPS;
    }

    /**
     * Main loop function
     * @param currentTime Current timestamp
     */
    private loop(currentTime: number): void {
        if (!this.isRunning) {
            return;
        }

        // Calculate delta time and cap it
        let deltaTime = currentTime - this.lastFrameTime;
        deltaTime = Math.min(deltaTime, this.config.maxFrameTime);

        this.accumulator += deltaTime;
        this.lastFrameTime = currentTime;

        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.fpsTimer >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = currentTime;
        }

        // Fixed time step updates
        while (this.accumulator >= this.config.updateInterval) {
            try {
                this.update(this.config.updateInterval / 1000); // Convert to seconds
                this.accumulator -= this.config.updateInterval;
            } catch (error) {
                console.error('Error in update loop:', error);
                this.stop();
                return;
            }
        }

        // Render
        try {
            this.render();
        } catch (error) {
            console.error('Error in render loop:', error);
            this.stop();
            return;
        }

        // Schedule next frame
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Updates all game systems
     * @param deltaTime Time since last update in seconds
     */
    private update(deltaTime: number): void {
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    /**
     * Renders all game systems that have render methods
     */
    private render(): void {
        for (const system of this.systems) {
            if (system.render) {
                system.render();
            }
        }
    }
}

/**
 * Creates and configures a new GameLoop instance
 * @param config Optional configuration override
 * @returns Configured GameLoop instance
 */
export function createGameLoop(config?: Partial<GameLoopConfig>): GameLoop {
    return new GameLoop(config);
}