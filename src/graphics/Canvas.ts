/**
 * Canvas.ts
 * Manages the game's canvas element and provides core rendering functionality.
 * @module graphics/Canvas
 */

/**
 * Configuration interface for canvas initialization
 */
interface CanvasConfig {
    width: number;
    height: number;
    containerId?: string;
    backgroundColor?: string;
}

/**
 * Manages canvas creation, initialization, and basic rendering operations
 */
export class Canvas {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;
    private width: number;
    private height: number;
    private backgroundColor: string;
    private isInitialized: boolean = false;

    /**
     * Creates a new Canvas instance
     * @param config - Canvas configuration options
     */
    constructor(config: CanvasConfig) {
        this.width = config.width;
        this.height = config.height;
        this.backgroundColor = config.backgroundColor || '#000000';
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        
        this.initialize(config.containerId);
    }

    /**
     * Initializes the canvas with specified dimensions and container
     * @param containerId - Optional DOM container ID to append the canvas
     * @throws Error if canvas context cannot be obtained
     */
    private initialize(containerId?: string): void {
        if (this.isInitialized) {
            return;
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        if (!this.context) {
            throw new Error('Failed to get canvas rendering context');
        }

        if (containerId) {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container element with id '${containerId}' not found`);
            }
            container.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }

        this.isInitialized = true;
    }

    /**
     * Clears the entire canvas
     */
    public clear(): void {
        if (!this.context) {
            return;
        }
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Gets the canvas rendering context
     * @returns The 2D rendering context
     * @throws Error if context is null
     */
    public getContext(): CanvasRenderingContext2D {
        if (!this.context) {
            throw new Error('Canvas context is not available');
        }
        return this.context;
    }

    /**
     * Gets the canvas element
     * @returns The HTML canvas element
     */
    public getElement(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Resizes the canvas to specified dimensions
     * @param width - New canvas width
     * @param height - New canvas height
     */
    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Gets the current canvas dimensions
     * @returns Object containing width and height
     */
    public getDimensions(): { width: number; height: number } {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Sets the background color of the canvas
     * @param color - CSS color string
     */
    public setBackgroundColor(color: string): void {
        this.backgroundColor = color;
    }

    /**
     * Checks if the canvas is properly initialized
     * @returns boolean indicating initialization status
     */
    public isReady(): boolean {
        return this.isInitialized && !!this.context;
    }

    /**
     * Saves the current canvas state
     */
    public save(): void {
        this.context?.save();
    }

    /**
     * Restores the previously saved canvas state
     */
    public restore(): void {
        this.context?.restore();
    }
}

/**
 * Creates and returns a new Canvas instance with the specified configuration
 * @param config - Canvas configuration options
 * @returns New Canvas instance
 */
export const createCanvas = (config: CanvasConfig): Canvas => {
    return new Canvas(config);
};