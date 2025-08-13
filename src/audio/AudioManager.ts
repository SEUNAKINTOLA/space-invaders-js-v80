/**
 * @file AudioManager.ts
 * @description Manages audio playback, loading, and control for the game.
 * Handles both sound effects and background music with volume control and muting capabilities.
 */

type AudioResource = {
    buffer: AudioBuffer;
    name: string;
    category: 'sfx' | 'music';
};

export class AudioManager {
    private static instance: AudioManager;
    private audioContext: AudioContext | null;
    private audioResources: Map<string, AudioResource>;
    private activeAudio: Map<string, GainNode>;
    private masterVolume: GainNode | null;
    private musicVolume: GainNode | null;
    private sfxVolume: GainNode | null;
    private isMuted: boolean;

    private constructor() {
        this.audioContext = null;
        this.audioResources = new Map();
        this.activeAudio = new Map();
        this.masterVolume = null;
        this.musicVolume = null;
        this.sfxVolume = null;
        this.isMuted = false;
    }

    /**
     * Gets the singleton instance of AudioManager
     */
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Initializes the audio system
     * @throws Error if Web Audio API is not supported
     */
    public async initialize(): Promise<void> {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Initialize volume controls
            this.masterVolume = this.audioContext.createGain();
            this.musicVolume = this.audioContext.createGain();
            this.sfxVolume = this.audioContext.createGain();

            // Connect volume nodes
            this.musicVolume.connect(this.masterVolume);
            this.sfxVolume.connect(this.masterVolume);
            this.masterVolume.connect(this.audioContext.destination);

        } catch (error) {
            throw new Error('Audio system initialization failed: Web Audio API not supported');
        }
    }

    /**
     * Loads an audio file and stores it in the audio resources
     * @param url The URL of the audio file to load
     * @param name Unique identifier for the audio resource
     * @param category Whether this is a sound effect or music
     */
    public async loadAudio(url: string, name: string, category: 'sfx' | 'music'): Promise<void> {
        try {
            if (!this.audioContext) {
                throw new Error('Audio system not initialized');
            }

            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.audioResources.set(name, {
                buffer: audioBuffer,
                name,
                category
            });
        } catch (error) {
            throw new Error(`Failed to load audio resource ${name}: ${error}`);
        }
    }

    /**
     * Plays an audio resource
     * @param name The identifier of the audio resource to play
     * @param loop Whether the audio should loop
     * @returns A promise that resolves when the audio starts playing
     */
    public async play(name: string, loop: boolean = false): Promise<void> {
        if (!this.audioContext) {
            throw new Error('Audio system not initialized');
        }

        const resource = this.audioResources.get(name);
        if (!resource) {
            throw new Error(`Audio resource ${name} not found`);
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = resource.buffer;
        source.loop = loop;

        // Connect to appropriate volume control
        source.connect(gainNode);
        gainNode.connect(resource.category === 'sfx' ? this.sfxVolume! : this.musicVolume!);

        this.activeAudio.set(name, gainNode);
        
        source.start(0);
        source.onended = () => {
            this.activeAudio.delete(name);
        };
    }

    /**
     * Sets the master volume level
     * @param level Volume level from 0 to 1
     */
    public setMasterVolume(level: number): void {
        if (this.masterVolume) {
            this.masterVolume.gain.value = Math.max(0, Math.min(1, level));
        }
    }

    /**
     * Sets the volume level for a specific category
     * @param category The category to adjust (sfx or music)
     * @param level Volume level from 0 to 1
     */
    public setCategoryVolume(category: 'sfx' | 'music', level: number): void {
        const volumeNode = category === 'sfx' ? this.sfxVolume : this.musicVolume;
        if (volumeNode) {
            volumeNode.gain.value = Math.max(0, Math.min(1, level));
        }
    }

    /**
     * Stops all currently playing audio
     */
    public stopAll(): void {
        if (!this.audioContext) return;

        this.activeAudio.forEach((gainNode) => {
            gainNode.disconnect();
        });
        this.activeAudio.clear();
    }

    /**
     * Mutes/unmutes all audio
     * @param mute Whether to mute (true) or unmute (false)
     */
    public setMute(mute: boolean): void {
        this.isMuted = mute;
        if (this.masterVolume) {
            this.masterVolume.gain.value = mute ? 0 : 1;
        }
    }

    /**
     * Resumes the audio context if it was suspended
     */
    public async resume(): Promise<void> {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Cleans up audio resources
     */
    public dispose(): void {
        this.stopAll();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.audioResources.clear();
    }
}