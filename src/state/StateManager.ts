/**
 * @file StateManager.ts
 * @description Game state management system for Space Invaders
 */

/**
 * Represents the possible states of the game
 */
export enum GameStateType {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/**
 * Interface for state change event handlers
 */
type StateChangeHandler = (prevState: GameStateType, newState: GameStateType) => void;

/**
 * Interface for game state data
 */
export interface GameStateData {
  score: number;
  level: number;
  lives: number;
  highScore: number;
  isPaused: boolean;
}

/**
 * Manages the game state and provides methods to modify and observe state changes
 */
export class StateManager {
  private static instance: StateManager;
  private currentState: GameStateType;
  private gameData: GameStateData;
  private stateChangeHandlers: Set<StateChangeHandler>;

  private constructor() {
    this.currentState = GameStateType.LOADING;
    this.stateChangeHandlers = new Set();
    this.gameData = {
      score: 0,
      level: 1,
      lives: 3,
      highScore: 0,
      isPaused: false,
    };
  }

  /**
   * Gets the singleton instance of StateManager
   */
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Gets the current game state
   */
  public getCurrentState(): GameStateType {
    return this.currentState;
  }

  /**
   * Gets the current game data
   */
  public getGameData(): Readonly<GameStateData> {
    return { ...this.gameData };
  }

  /**
   * Updates the game state and notifies all listeners
   * @param newState - The new state to transition to
   * @throws Error if the state transition is invalid
   */
  public setState(newState: GameStateType): void {
    if (!this.isValidStateTransition(this.currentState, newState)) {
      throw new Error(`Invalid state transition from ${this.currentState} to ${newState}`);
    }

    const prevState = this.currentState;
    this.currentState = newState;
    this.notifyStateChange(prevState, newState);
  }

  /**
   * Updates specific game data fields
   * @param updates - Partial game data to update
   */
  public updateGameData(updates: Partial<GameStateData>): void {
    this.gameData = {
      ...this.gameData,
      ...updates,
    };
  }

  /**
   * Registers a state change handler
   * @param handler - Function to be called when state changes
   */
  public addStateChangeHandler(handler: StateChangeHandler): void {
    this.stateChangeHandlers.add(handler);
  }

  /**
   * Removes a state change handler
   * @param handler - Handler to remove
   */
  public removeStateChangeHandler(handler: StateChangeHandler): void {
    this.stateChangeHandlers.delete(handler);
  }

  /**
   * Resets the game state to initial values
   */
  public resetGame(): void {
    const highScore = this.gameData.highScore;
    this.gameData = {
      score: 0,
      level: 1,
      lives: 3,
      highScore,
      isPaused: false,
    };
    this.setState(GameStateType.MENU);
  }

  /**
   * Validates if a state transition is allowed
   * @param currentState - The current state
   * @param newState - The proposed new state
   */
  private isValidStateTransition(currentState: GameStateType, newState: GameStateType): boolean {
    // Define valid state transitions
    const validTransitions = new Map<GameStateType, Set<GameStateType>>([
      [GameStateType.LOADING, new Set([GameStateType.MENU])],
      [GameStateType.MENU, new Set([GameStateType.PLAYING])],
      [GameStateType.PLAYING, new Set([GameStateType.PAUSED, GameStateType.GAME_OVER])],
      [GameStateType.PAUSED, new Set([GameStateType.PLAYING, GameStateType.MENU])],
      [GameStateType.GAME_OVER, new Set([GameStateType.MENU])],
    ]);

    const allowedTransitions = validTransitions.get(currentState);
    return allowedTransitions?.has(newState) ?? false;
  }

  /**
   * Notifies all registered handlers of a state change
   * @param prevState - The previous state
   * @param newState - The new state
   */
  private notifyStateChange(prevState: GameStateType, newState: GameStateType): void {
    this.stateChangeHandlers.forEach(handler => {
      try {
        handler(prevState, newState);
      } catch (error) {
        console.error('Error in state change handler:', error);
      }
    });
  }
}

// Export a default instance for convenience
export default StateManager.getInstance();