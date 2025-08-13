/**
 * @file KeyboardInput.ts
 * @description Handles keyboard input events for the game, providing a clean interface
 * for checking key states and managing keyboard interactions.
 */

export type KeyState = {
  isPressed: boolean;
  wasPressed: boolean;
};

export class KeyboardInput {
  private static instance: KeyboardInput;
  private keyStates: Map<string, KeyState>;
  private enabled: boolean;

  private constructor() {
    this.keyStates = new Map();
    this.enabled = false;
    this.initializeEventListeners();
  }

  /**
   * Gets the singleton instance of KeyboardInput
   * @returns KeyboardInput instance
   */
  public static getInstance(): KeyboardInput {
    if (!KeyboardInput.instance) {
      KeyboardInput.instance = new KeyboardInput();
    }
    return KeyboardInput.instance;
  }

  /**
   * Initializes keyboard event listeners
   * @private
   */
  private initializeEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
  }

  /**
   * Handles keydown events
   * @param event Keyboard event
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;
    
    // Prevent default behavior for game control keys
    if (this.isGameControlKey(event.code)) {
      event.preventDefault();
    }

    const keyState = this.keyStates.get(event.code) || { isPressed: false, wasPressed: false };
    this.keyStates.set(event.code, {
      isPressed: true,
      wasPressed: keyState.isPressed
    });
  }

  /**
   * Handles keyup events
   * @param event Keyboard event
   * @private
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return;
    
    const keyState = this.keyStates.get(event.code) || { isPressed: false, wasPressed: false };
    this.keyStates.set(event.code, {
      isPressed: false,
      wasPressed: keyState.isPressed
    });
  }

  /**
   * Handles window blur events
   * @private
   */
  private handleBlur(): void {
    // Reset all key states when window loses focus
    this.keyStates.clear();
  }

  /**
   * Checks if a key is currently pressed
   * @param keyCode The key code to check
   * @returns boolean indicating if the key is pressed
   */
  public isKeyPressed(keyCode: string): boolean {
    const keyState = this.keyStates.get(keyCode);
    return keyState ? keyState.isPressed : false;
  }

  /**
   * Checks if a key was just pressed this frame
   * @param keyCode The key code to check
   * @returns boolean indicating if the key was just pressed
   */
  public isKeyJustPressed(keyCode: string): boolean {
    const keyState = this.keyStates.get(keyCode);
    return keyState ? (keyState.isPressed && !keyState.wasPressed) : false;
  }

  /**
   * Updates the previous key states
   * Should be called at the end of each game loop iteration
   */
  public update(): void {
    for (const [key, state] of this.keyStates) {
      this.keyStates.set(key, {
        isPressed: state.isPressed,
        wasPressed: state.isPressed
      });
    }
  }

  /**
   * Enables keyboard input
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * Disables keyboard input
   */
  public disable(): void {
    this.enabled = false;
    this.keyStates.clear();
  }

  /**
   * Checks if the given key is a game control key
   * @param keyCode The key code to check
   * @returns boolean indicating if the key is a game control
   * @private
   */
  private isGameControlKey(keyCode: string): boolean {
    const gameControls = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Space',
      'Enter',
      'Escape'
    ];
    return gameControls.includes(keyCode);
  }

  /**
   * Cleans up event listeners
   */
  public cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
    this.keyStates.clear();
  }
}

export default KeyboardInput;