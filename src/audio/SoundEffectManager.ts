/**
 * @file SoundEffectManager.ts
 * @description Manages sound effects for the Space Invaders game, handling loading,
 * playing, and caching of sound effects with proper resource management.
 */

type SoundEffectConfig = {
    volume: number;
    loop: boolean;
    playbackRate: number;
};

/**
 * Represents the state of a loaded sound effect
 */
interface LoadedSound {
    buffer: AudioBuffer;
    lastPlayed: number;
}

/**
 * Manages game sound effects with features like caching, pooling, and volume control
 */
export class SoundEffectManager {
    private readonly context: AudioContext;
    private readonly soundCache: Map<string, LoadedSound>;
    private readonly maxConcurrentSounds: number;
    private readonly activeSounds: Set<AudioBufferSourceNode>;
    private masterVolume: number;
    private muted: boolean;

    /**
     * Creates a new SoundEffectManager instance
     * @param maxConcurrentSounds Maximum number of sounds that can play simultaneously
     */
    constructor(maxConcurrentSounds: number = 32) {
        this.context = new AudioContext();
        this.soundCache = new Map();
        this.maxConcurrentSounds = maxConcurrentSounds;
        this.activeSounds = new Set();
        this.masterVolume = 1.0;
        this.muted = false;
    }

    /**
     * Loads a sound effect from a URL and caches it
     * @param soundId Unique identifier for the sound
     * @param url URL of the sound file
     * @throws Error if loading fails
     */
    public async loadSound(soundId: string, url: string): Promise<void> {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

            this.soundCache.set(soundId, {
                buffer: audioBuffer,
                lastPlayed: 0
            });
        } catch (error) {
            throw new Error(`Failed to load sound effect ${soundId}: ${error.message}`);
        }
    }

    /**
     * Plays a sound effect with specified configuration
     * @param soundId ID of the sound to play
     * @param config Optional configuration for sound playback
     * @returns Promise that resolves when the sound starts playing
     */
    public async playSound(
        soundId: string,
        config: Partial<SoundEffectConfig> = {}
    ): Promise<void> {
        if (this.muted || !this.soundCache.has(soundId)) {
            return;
        }

        const sound = this.soundCache.get(soundId)!;
        
        // Clean up finished sounds
        this.cleanupFinishedSounds();

        // Check if we can play more sounds
        if (this.activeSounds.size >= this.maxConcurrentSounds) {
            return;
        }

        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = sound.buffer;
        source.loop = config.loop ?? false;
        source.playbackRate.value = config.playbackRate ?? 1.0;

        // Apply volume
        const volume = (config.volume ?? 1.0) * this.masterVolume;
        gainNode.gain.value = volume;

        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        // Track active sound
        this.activeSounds.add(source);

        // Update last played time
        sound.lastPlayed = Date.now();

        // Clean up when sound finishes
        source.onended = () => {
            this.activeSounds.delete(source);
            source.disconnect();
            gainNode.disconnect();
        };

        source.start(0);
    }

    /**
     * Sets the master volume for all sound effects
     * @param volume Volume level (0.0 to 1.0)
     */
    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Mutes or unmutes all sound effects
     * @param muted Whether to mute sounds
     */
    public setMuted(muted: boolean): void {
        this.muted = muted;
    }

    /**
     * Stops all currently playing sounds
     */
    public stopAllSounds(): void {
        this.activeSounds.forEach(source => {
            try {
                source.stop();
            } catch (error) {
                // Ignore errors from already stopped sounds
            }
        });
        this.activeSounds.clear();
    }

    /**
     * Releases resources and stops all sounds
     */
    public dispose(): void {
        this.stopAllSounds();
        this.soundCache.clear();
        if (this.context.state !== 'closed') {
            this.context.close();
        }
    }

    /**
     * Removes finished sounds from the active sounds tracking
     */
    private cleanupFinishedSounds(): void {
        for (const source of this.activeSounds) {
            if (source.playbackState === source.FINISHED) {
                this.activeSounds.delete(source);
            }
        }
    }

    /**
     * Checks if a sound effect is loaded
     * @param soundId ID of the sound to check
     * @returns True if the sound is loaded
     */
    public isSoundLoaded(soundId: string): boolean {
        return this.soundCache.has(soundId);
    }

    /**
     * Gets the current number of active sounds
     * @returns Number of currently playing sounds
     */
    public getActiveSoundCount(): number {
        return this.activeSounds.size;
    }
}