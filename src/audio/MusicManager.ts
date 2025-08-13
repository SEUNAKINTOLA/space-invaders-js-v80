/**
 * @file MusicManager.ts
 * @description Manages background music playback with crossfading capabilities for Space Invaders JS V80
 */

export interface MusicTrack {
    id: string;
    url: string;
    volume: number;
    loop: boolean;
}

export enum MusicState {
    PLAYING = 'playing',
    PAUSED = 'paused',
    STOPPED = 'stopped',
    FADING = 'fading'
}

export class MusicManager {
    private static instance: MusicManager;
    private audioContext: AudioContext | null;
    private tracks: Map<string, AudioBuffer>;
    private currentSource: AudioBufferSourceNode | null;
    private nextSource: AudioBufferSourceNode | null;
    private gainNode: GainNode | null;
    private nextGainNode: GainNode | null;
    private currentTrackId: string | null;
    private state: MusicState;
    private fadeTime: number;

    private constructor() {
        this.audioContext = null;
        this.tracks = new Map();
        this.currentSource = null;
        this.nextSource = null;
        this.gainNode = null;
        this.nextGainNode = null;
        this.currentTrackId = null;
        this.state = MusicState.STOPPED;
        this.fadeTime = 2.0; // Default fade duration in seconds
    }

    /**
     * Gets the singleton instance of MusicManager
     */
    public static getInstance(): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager();
        }
        return MusicManager.instance;
    }

    /**
     * Initializes the audio context and sets up the system
     */
    public async initialize(): Promise<void> {
        try {
            this.audioContext = new AudioContext();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        } catch (error) {
            console.error('Failed to initialize MusicManager:', error);
            throw new Error('Audio context initialization failed');
        }
    }

    /**
     * Loads a music track into memory
     * @param track The music track to load
     */
    public async loadTrack(track: MusicTrack): Promise<void> {
        if (!this.audioContext) {
            throw new Error('MusicManager not initialized');
        }

        try {
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.tracks.set(track.id, audioBuffer);
        } catch (error) {
            console.error(`Failed to load track ${track.id}:`, error);
            throw new Error(`Failed to load track ${track.id}`);
        }
    }

    /**
     * Plays a music track with optional crossfade
     * @param trackId The ID of the track to play
     * @param crossfade Whether to crossfade from the current track
     */
    public async play(trackId: string, crossfade: boolean = true): Promise<void> {
        if (!this.audioContext || !this.gainNode) {
            throw new Error('MusicManager not initialized');
        }

        const trackBuffer = this.tracks.get(trackId);
        if (!trackBuffer) {
            throw new Error(`Track ${trackId} not loaded`);
        }

        if (crossfade && this.currentSource) {
            await this.crossfade(trackBuffer, trackId);
        } else {
            this.stopCurrent();
            this.playTrack(trackBuffer, trackId);
        }
    }

    /**
     * Stops the currently playing music
     */
    public stop(): void {
        this.stopCurrent();
        this.state = MusicState.STOPPED;
    }

    /**
     * Pauses the currently playing music
     */
    public pause(): void {
        if (this.audioContext) {
            this.audioContext.suspend();
            this.state = MusicState.PAUSED;
        }
    }

    /**
     * Resumes playback of paused music
     */
    public resume(): void {
        if (this.audioContext) {
            this.audioContext.resume();
            this.state = MusicState.PLAYING;
        }
    }

    /**
     * Sets the master volume
     * @param volume Volume level (0.0 to 1.0)
     */
    public setVolume(volume: number): void {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Gets the current playback state
     */
    public getState(): MusicState {
        return this.state;
    }

    private async crossfade(newBuffer: AudioBuffer, newTrackId: string): Promise<void> {
        if (!this.audioContext || !this.gainNode) return;

        this.state = MusicState.FADING;
        
        // Create and configure new track
        this.nextSource = this.audioContext.createBufferSource();
        this.nextGainNode = this.audioContext.createGain();
        this.nextSource.buffer = newBuffer;
        this.nextSource.loop = true;
        
        // Connect new track
        this.nextSource.connect(this.nextGainNode);
        this.nextGainNode.connect(this.audioContext.destination);
        
        // Start with zero volume
        this.nextGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Fade out current track
        if (this.gainNode) {
            this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + this.fadeTime);
        }
        
        // Fade in new track
        this.nextGainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + this.fadeTime);
        
        // Start new track
        this.nextSource.start();
        
        // Wait for fade to complete
        await new Promise(resolve => setTimeout(resolve, this.fadeTime * 1000));
        
        // Clean up old track
        this.stopCurrent();
        
        // Move new track to current
        this.currentSource = this.nextSource;
        this.gainNode = this.nextGainNode;
        this.currentTrackId = newTrackId;
        this.nextSource = null;
        this.nextGainNode = null;
        
        this.state = MusicState.PLAYING;
    }

    private playTrack(buffer: AudioBuffer, trackId: string): void {
        if (!this.audioContext || !this.gainNode) return;

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = buffer;
        this.currentSource.loop = true;
        this.currentSource.connect(this.gainNode);
        this.currentSource.start();
        this.currentTrackId = trackId;
        this.state = MusicState.PLAYING;
    }

    private stopCurrent(): void {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignore errors if source is already stopped
            }
            this.currentSource.disconnect();
            this.currentSource = null;
        }
    }
}

export default MusicManager;