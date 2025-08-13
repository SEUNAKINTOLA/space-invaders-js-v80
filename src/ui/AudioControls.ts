/**
 * @file AudioControls.ts
 * @description UI component for managing audio settings in the game
 */

export interface AudioControlsConfig {
    container: HTMLElement;
    initialVolume: number;
    initialMusicEnabled: boolean;
    initialSoundEffectsEnabled: boolean;
    onVolumeChange?: (volume: number) => void;
    onMusicToggle?: (enabled: boolean) => void;
    onSoundEffectsToggle?: (enabled: boolean) => void;
}

export class AudioControls {
    private container: HTMLElement;
    private controlsElement: HTMLElement;
    private volumeSlider: HTMLInputElement;
    private musicToggle: HTMLInputElement;
    private sfxToggle: HTMLInputElement;

    private currentVolume: number;
    private isMusicEnabled: boolean;
    private isSoundEffectsEnabled: boolean;

    private onVolumeChange?: (volume: number) => void;
    private onMusicToggle?: (enabled: boolean) => void;
    private onSoundEffectsToggle?: (enabled: boolean) => void;

    /**
     * Creates a new AudioControls instance
     * @param config Configuration options for the audio controls
     */
    constructor(config: AudioControlsConfig) {
        this.container = config.container;
        this.currentVolume = config.initialVolume;
        this.isMusicEnabled = config.initialMusicEnabled;
        this.isSoundEffectsEnabled = config.initialSoundEffectsEnabled;
        
        this.onVolumeChange = config.onVolumeChange;
        this.onMusicToggle = config.onMusicToggle;
        this.onSoundEffectsToggle = config.onSoundEffectsToggle;

        this.initializeControls();
    }

    /**
     * Initializes the audio control elements
     * @private
     */
    private initializeControls(): void {
        this.controlsElement = document.createElement('div');
        this.controlsElement.className = 'audio-controls';
        this.createVolumeControl();
        this.createMusicToggle();
        this.createSoundEffectsToggle();
        this.container.appendChild(this.controlsElement);
    }

    /**
     * Creates the volume slider control
     * @private
     */
    private createVolumeControl(): void {
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'volume-control';

        const label = document.createElement('label');
        label.textContent = 'Master Volume:';

        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = '0';
        this.volumeSlider.max = '1';
        this.volumeSlider.step = '0.1';
        this.volumeSlider.value = this.currentVolume.toString();

        this.volumeSlider.addEventListener('input', this.handleVolumeChange.bind(this));

        volumeContainer.appendChild(label);
        volumeContainer.appendChild(this.volumeSlider);
        this.controlsElement.appendChild(volumeContainer);
    }

    /**
     * Creates the music toggle control
     * @private
     */
    private createMusicToggle(): void {
        const musicContainer = document.createElement('div');
        musicContainer.className = 'music-toggle';

        const label = document.createElement('label');
        label.textContent = 'Music:';

        this.musicToggle = document.createElement('input');
        this.musicToggle.type = 'checkbox';
        this.musicToggle.checked = this.isMusicEnabled;

        this.musicToggle.addEventListener('change', this.handleMusicToggle.bind(this));

        musicContainer.appendChild(label);
        musicContainer.appendChild(this.musicToggle);
        this.controlsElement.appendChild(musicContainer);
    }

    /**
     * Creates the sound effects toggle control
     * @private
     */
    private createSoundEffectsToggle(): void {
        const sfxContainer = document.createElement('div');
        sfxContainer.className = 'sfx-toggle';

        const label = document.createElement('label');
        label.textContent = 'Sound Effects:';

        this.sfxToggle = document.createElement('input');
        this.sfxToggle.type = 'checkbox';
        this.sfxToggle.checked = this.isSoundEffectsEnabled;

        this.sfxToggle.addEventListener('change', this.handleSoundEffectsToggle.bind(this));

        sfxContainer.appendChild(label);
        sfxContainer.appendChild(this.sfxToggle);
        this.controlsElement.appendChild(sfxContainer);
    }

    /**
     * Handles volume slider changes
     * @private
     * @param event Input event from volume slider
     */
    private handleVolumeChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.currentVolume = parseFloat(target.value);
        this.onVolumeChange?.(this.currentVolume);
    }

    /**
     * Handles music toggle changes
     * @private
     * @param event Change event from music toggle
     */
    private handleMusicToggle(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.isMusicEnabled = target.checked;
        this.onMusicToggle?.(this.isMusicEnabled);
    }

    /**
     * Handles sound effects toggle changes
     * @private
     * @param event Change event from sound effects toggle
     */
    private handleSoundEffectsToggle(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.isSoundEffectsEnabled = target.checked;
        this.onSoundEffectsToggle?.(this.isSoundEffectsEnabled);
    }

    /**
     * Updates the volume display value
     * @param volume New volume value
     */
    public setVolume(volume: number): void {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        this.volumeSlider.value = this.currentVolume.toString();
    }

    /**
     * Updates the music toggle state
     * @param enabled New music enabled state
     */
    public setMusicEnabled(enabled: boolean): void {
        this.isMusicEnabled = enabled;
        this.musicToggle.checked = enabled;
    }

    /**
     * Updates the sound effects toggle state
     * @param enabled New sound effects enabled state
     */
    public setSoundEffectsEnabled(enabled: boolean): void {
        this.isSoundEffectsEnabled = enabled;
        this.sfxToggle.checked = enabled;
    }

    /**
     * Removes the audio controls from the DOM
     */
    public destroy(): void {
        this.container.removeChild(this.controlsElement);
    }
}