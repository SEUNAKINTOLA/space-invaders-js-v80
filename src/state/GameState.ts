/**
 * @file GameState.ts
 * @description Game state management system for Space Invaders JS V80
 */

/**
 * Represents the possible states of the game
 */
export enum GameStatus {
  INIT = 'INIT',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN'
}

/**
 * Interface representing player statistics
 */
export interface PlayerStats {
  score: number;
  lives: number;
  level: number;
  highScore: number;
}

/**
 * Interface representing game settings
 */
export interface GameSettings {
  difficulty: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

/**
 * Interface representing the complete game state
 */
export interface GameState {
  status: GameStatus;
  playerStats: PlayerStats;
  settings: GameSettings;
  lastUpdated: number;
  entities: EntityState[];
  isPaused: boolean;
}

/**
 * Interface representing the state of a game entity
 */
export interface EntityState {
  id: string;
  type: string;
  position: Vector2D;
  velocity: Vector2D;
  isActive: boolean;
}

/**
 * Interface representing a 2D vector
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7
};

/**
 * Initial player statistics
 */
export const INITIAL_PLAYER_STATS: PlayerStats = {
  score: 0,
  lives: 3,
  level: 1,
  highScore: 0
};

/**
 * Creates the initial game state
 * @returns {GameState} The initial game state
 */
export function createInitialState(): GameState {
  return {
    status: GameStatus.INIT,
    playerStats: { ...INITIAL_PLAYER_STATS },
    settings: { ...DEFAULT_SETTINGS },
    lastUpdated: Date.now(),
    entities: [],
    isPaused: false
  };
}

/**
 * Class responsible for managing the game state
 */
export class GameStateManager {
  private state: GameState;
  private listeners: Set<(state: GameState) => void>;

  constructor() {
    this.state = createInitialState();
    this.listeners = new Set();
  }

  /**
   * Gets the current game state
   * @returns {GameState} Current game state
   */
  public getState(): Readonly<GameState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Updates the game state
   * @param updater - Function that returns the new state
   */
  public updateState(updater: (currentState: GameState) => Partial<GameState>): void {
    const newState = {
      ...this.state,
      ...updater(this.state),
      lastUpdated: Date.now()
    };

    this.state = newState;
    this.notifyListeners();
  }

  /**
   * Subscribes to state changes
   * @param listener - Callback function to be called on state changes
   * @returns {() => void} Unsubscribe function
   */
  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Resets the game state to initial values
   */
  public resetState(): void {
    this.state = createInitialState();
    this.notifyListeners();
  }

  /**
   * Notifies all listeners of state changes
   */
  private notifyListeners(): void {
    const frozenState = Object.freeze({ ...this.state });
    this.listeners.forEach(listener => listener(frozenState));
  }
}

// Export a singleton instance of the GameStateManager
export const gameState = new GameStateManager();