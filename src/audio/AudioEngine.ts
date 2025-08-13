/**
 * @file AudioEngine.ts
 * @description Base audio engine class for managing game audio including sound effects and music
 */

/**
 * Represents the state of an audio instance
 */
export enum AudioState {
  UNINITIALIZED = 'UNINITIALIZED',
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

/**
 * Configuration options for the audio engine
 */
export interface AudioEngineConfig {
  masterVolume?: number;
  maxSimultaneousSounds?: number;
  enabledByDefault?: boolean;
}

/**
 * Audio file metadata and settings
 */
export interface AudioMetadata {
  id: string;
  path: string;
  volume?: number;
  loop?: boolean;
  category?: 'MUSIC' | 'SFX';
}

/**
 * Base class for handling game audio functionality
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeAudio: Map<string, AudioBufferSourceNode> = new Map();
  private state: AudioState = AudioState.UNINITIALIZED;
  private masterVolume: number;
  private maxSimultaneousSounds: number;
  private enabled: boolean;

  /**
   * Creates a new AudioEngine instance
   * @param config - Configuration options for the audio engine
   */
  constructor(config: AudioEngineConfig = {}) {
    this.masterVolume = config.masterVolume ?? 1.0;
    this.maxSimultaneousSounds = config.maxSimultaneousSounds ?? 32;
    this.enabled = config.enabledByDefault ?? true;
  }

  /**
   * Initializes the audio engine
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    try {
      this.context = new AudioContext();
      this.state = AudioState.READY;
    } catch (error) {
      this.state = AudioState.ERROR;
      throw new Error(`Failed to initialize AudioEngine: ${error}`);
    }
  }

  /**
   * Loads an audio file into memory
   * @param metadata - Audio file metadata
   * @returns Promise that resolves when the audio is loaded
   */
  public async loadAudio(metadata: AudioMetadata): Promise<void> {
    if (!this.context || this.state !== AudioState.READY) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      const response = await fetch(metadata.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(metadata.id, audioBuffer);
    } catch (error) {
      throw new Error(`Failed to load audio ${metadata.id}: ${error}`);
    }
  }

  /**
   * Plays an audio file
   * @param id - ID of the audio to play
   * @param options - Playback options
   * @returns Promise that resolves with the audio ID
   */
  public async play(id: string, options: { volume?: number; loop?: boolean } = {}): Promise<string> {
    if (!this.enabled) return id;
    if (!this.context || this.state !== AudioState.READY) {
      throw new Error('AudioEngine not initialized');
    }

    const buffer = this.audioBuffers.get(id);
    if (!buffer) {
      throw new Error(`Audio ${id} not loaded`);
    }

    if (this.activeAudio.size >= this.maxSimultaneousSounds) {
      this.stopOldestSound();
    }

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = buffer;
    source.loop = options.loop ?? false;

    gainNode.gain.value = (options.volume ?? 1.0) * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
    this.activeAudio.set(id, source);

    source.onended = () => {
      this.activeAudio.delete(id);
    };

    return id;
  }

  /**
   * Stops playback of an audio file
   * @param id - ID of the audio to stop
   */
  public stop(id: string): void {
    const source = this.activeAudio.get(id);
    if (source) {
      try {
        source.stop();
        this.activeAudio.delete(id);
      } catch (error) {
        console.warn(`Error stopping audio ${id}:`, error);
      }
    }
  }

  /**
   * Sets the master volume for all audio
   * @param volume - Volume level (0.0 to 1.0)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enables or disables the audio engine
   * @param enabled - Whether to enable audio
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Stops all currently playing audio
   */
  public stopAll(): void {
    this.activeAudio.forEach((source, id) => {
      this.stop(id);
    });
  }

  /**
   * Releases resources and cleans up the audio engine
   */
  public dispose(): void {
    this.stopAll();
    this.audioBuffers.clear();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.state = AudioState.UNINITIALIZED;
  }

  /**
   * Gets the current state of the audio engine
   */
  public getState(): AudioState {
    return this.state;
  }

  /**
   * Stops the oldest playing sound when maximum simultaneous sounds is reached
   * @private
   */
  private stopOldestSound(): void {
    const firstKey = this.activeAudio.keys().next().value;
    if (firstKey) {
      this.stop(firstKey);
    }
  }
}