/**
 * @file Renderer.ts
 * @description Canvas rendering system for Space Invaders game
 */

/**
 * Configuration interface for renderer settings
 */
interface RendererConfig {
    width: number;
    height: number;
    backgroundColor: string;
    targetFPS: number;
}

/**
 * Represents a drawable object in the game
 */
interface Drawable {
    x: number;
    y: number;
    width: number;
    height: number;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * Main renderer class responsible for managing canvas rendering and animation
 */
export class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private config: RendererConfig;
    private isRunning: boolean;
    private drawables: Set<Drawable>;
    private lastFrameTime: number;

    /**
     * Creates a new Renderer instance
     * @param canvasId - The ID of the canvas element
     * @param config - Renderer configuration options
     */
    constructor(canvasId: string, config: Partial<RendererConfig> = {}) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }

        this.canvas = canvas;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D rendering context');
        }

        this.context = context;
        this.config = {
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            targetFPS: 60,
            ...config
        };

        this.isRunning = false;
        this.drawables = new Set();
        this.lastFrameTime = 0;

        this.initializeCanvas();
    }

    /**
     * Initializes canvas properties
     */
    private initializeCanvas(): void {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.context.imageSmoothingEnabled = false; // Better for pixel art games
    }

    /**
     * Clears the canvas
     */
    private clear(): void {
        this.context.fillStyle = this.config.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Main render loop
     * @param timestamp - Current timestamp from requestAnimationFrame
     */
    private render = (timestamp: number): void => {
        if (!this.isRunning) return;

        // Calculate delta time and FPS limiting
        const frameTime = 1000 / this.config.targetFPS;
        const delta = timestamp - this.lastFrameTime;

        if (delta < frameTime) {
            requestAnimationFrame(this.render);
            return;
        }

        this.lastFrameTime = timestamp;

        // Clear and render frame
        this.clear();

        // Draw all registered drawables
        this.drawables.forEach(drawable => {
            try {
                drawable.draw(this.context);
            } catch (error) {
                console.error('Error drawing object:', error);
            }
        });

        requestAnimationFrame(this.render);
    };

    /**
     * Starts the rendering loop
     */
    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.render);
    }

    /**
     * Stops the rendering loop
     */
    public stop(): void {
        this.isRunning = false;
    }

    /**
     * Adds a drawable object to the renderer
     * @param drawable - Object implementing the Drawable interface
     */
    public addDrawable(drawable: Drawable): void {
        this.drawables.add(drawable);
    }

    /**
     * Removes a drawable object from the renderer
     * @param drawable - Object to remove
     */
    public removeDrawable(drawable: Drawable): void {
        this.drawables.delete(drawable);
    }

    /**
     * Clears all drawable objects
     */
    public clearDrawables(): void {
        this.drawables.clear();
    }

    /**
     * Gets the canvas context
     * @returns The 2D rendering context
     */
    public getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    /**
     * Resizes the canvas
     * @param width - New width
     * @param height - New height
     */
    public resize(width: number, height: number): void {
        this.config.width = width;
        this.config.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }
}