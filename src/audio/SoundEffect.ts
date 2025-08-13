/**
 * @file SoundEffect.ts
 * @description Represents a sound effect in the game with management of its audio properties and playback state.
 */

/**
 * Represents the state of a sound effect
 */
export enum SoundState {
    UNLOADED = 'unloaded',
    LOADING = 'loading',
    READY = 'ready',
    PLAYING = 'playing',
    PAUSED = 'paused',
    ERROR = 'error'
}

/**
 * Configuration options for a sound effect
 */
export interface SoundEffectOptions {
    volume?: number;
    loop?: boolean;
    autoplay?: boolean;
    preload?: boolean;
}

/**
 * Represents a sound effect in the game
 */
export class SoundEffect {
    private audio: HTMLAudioElement;
    private state: SoundState;
    private volume: number;
    private loop: boolean;
    private readonly sourceUrl: string;

    /**
     * Creates a new sound effect instance
     * @param url - The URL of the audio file
     * @param options - Configuration options for the sound effect
     */
    constructor(url: string, options: SoundEffectOptions = {}) {
        this.sourceUrl = url;
        this.volume = options.volume ?? 1.0;
        this.loop = options.loop ?? false;
        this.state = SoundState.UNLOADED;
        this.audio = new Audio();

        this.initialize(options);
    }

    /**
     * Initializes the sound effect with the provided options
     * @param options - Configuration options for the sound effect
     */
    private async initialize(options: SoundEffectOptions): Promise<void> {
        try {
            this.state = SoundState.LOADING;
            this.audio.src = this.sourceUrl;
            this.audio.volume = this.volume;
            this.audio.loop = this.loop;

            // Set up event listeners
            this.setupEventListeners();

            if (options.preload) {
                await this.load();
            }

            if (options.autoplay) {
                await this.play();
            }
        } catch (error) {
            this.state = SoundState.ERROR;
            console.error(`Failed to initialize sound effect: ${error}`);
        }
    }

    /**
     * Sets up event listeners for the audio element
     */
    private setupEventListeners(): void {
        this.audio.addEventListener('canplaythrough', () => {
            this.state = SoundState.READY;
        });

        this.audio.addEventListener('playing', () => {
            this.state = SoundState.PLAYING;
        });

        this.audio.addEventListener('pause', () => {
            this.state = SoundState.PAUSED;
        });

        this.audio.addEventListener('error', (error) => {
            this.state = SoundState.ERROR;
            console.error(`Audio error: ${error}`);
        });
    }

    /**
     * Loads the sound effect
     * @returns Promise that resolves when the sound is loaded
     */
    public async load(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.state === SoundState.READY) {
                resolve();
                return;
            }

            this.audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            this.audio.addEventListener('error', (error) => reject(error), { once: true });
            this.audio.load();
        });
    }

    /**
     * Plays the sound effect
     * @returns Promise that resolves when the sound starts playing
     */
    public async play(): Promise<void> {
        try {
            if (this.state === SoundState.UNLOADED) {
                await this.load();
            }
            await this.audio.play();
        } catch (error) {
            console.error(`Failed to play sound effect: ${error}`);
            throw error;
        }
    }

    /**
     * Pauses the sound effect
     */
    public pause(): void {
        this.audio.pause();
    }

    /**
     * Stops the sound effect and resets it to the beginning
     */
    public stop(): void {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    /**
     * Sets the volume of the sound effect
     * @param value - Volume value between 0 and 1
     */
    public setVolume(value: number): void {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
    }

    /**
     * Gets the current state of the sound effect
     */
    public getState(): SoundState {
        return this.state;
    }

    /**
     * Cleans up resources used by the sound effect
     */
    public dispose(): void {
        this.stop();
        this.audio.removeAttribute('src');
        this.audio.load();
    }
}