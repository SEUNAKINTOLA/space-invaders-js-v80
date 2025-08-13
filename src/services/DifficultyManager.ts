/**
 * @file DifficultyManager.ts
 * @description Manages dynamic difficulty adjustment for the game based on player performance
 */

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXTREME = 'EXTREME'
}

export interface DifficultySettings {
  enemySpeed: number;
  enemyFireRate: number;
  enemyHealth: number;
  powerUpFrequency: number;
  scoreMultiplier: number;
}

export class DifficultyManager {
  private currentDifficulty: DifficultyLevel;
  private playerPerformanceScore: number;
  private difficultyUpdateInterval: number;
  private lastUpdateTime: number;

  // Difficulty thresholds for performance-based adjustments
  private static readonly MEDIUM_THRESHOLD = 1000;
  private static readonly HARD_THRESHOLD = 2500;
  private static readonly EXTREME_THRESHOLD = 5000;

  // Difficulty settings mapping
  private static readonly DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultySettings> = {
    [DifficultyLevel.EASY]: {
      enemySpeed: 1.0,
      enemyFireRate: 1.0,
      enemyHealth: 1,
      powerUpFrequency: 1.0,
      scoreMultiplier: 1.0
    },
    [DifficultyLevel.MEDIUM]: {
      enemySpeed: 1.3,
      enemyFireRate: 1.2,
      enemyHealth: 2,
      powerUpFrequency: 0.8,
      scoreMultiplier: 1.5
    },
    [DifficultyLevel.HARD]: {
      enemySpeed: 1.6,
      enemyFireRate: 1.5,
      enemyHealth: 3,
      powerUpFrequency: 0.6,
      scoreMultiplier: 2.0
    },
    [DifficultyLevel.EXTREME]: {
      enemySpeed: 2.0,
      enemyFireRate: 2.0,
      enemyHealth: 4,
      powerUpFrequency: 0.4,
      scoreMultiplier: 3.0
    }
  };

  constructor(initialDifficulty: DifficultyLevel = DifficultyLevel.EASY) {
    this.currentDifficulty = initialDifficulty;
    this.playerPerformanceScore = 0;
    this.difficultyUpdateInterval = 30000; // 30 seconds
    this.lastUpdateTime = Date.now();
  }

  /**
   * Updates the difficulty based on player performance
   * @param deltaTime Time elapsed since last update in milliseconds
   * @param currentScore Current player score
   * @param playerHealth Current player health
   */
  public updateDifficulty(deltaTime: number, currentScore: number, playerHealth: number): void {
    const currentTime = Date.now();
    
    if (currentTime - this.lastUpdateTime >= this.difficultyUpdateInterval) {
      this.calculatePerformanceScore(currentScore, playerHealth);
      this.adjustDifficultyLevel();
      this.lastUpdateTime = currentTime;
    }
  }

  /**
   * Calculates player performance score based on various metrics
   * @param currentScore Current player score
   * @param playerHealth Current player health
   */
  private calculatePerformanceScore(currentScore: number, playerHealth: number): void {
    // Performance score calculation formula
    this.playerPerformanceScore = currentScore * (playerHealth / 100);
  }

  /**
   * Adjusts the difficulty level based on player performance
   */
  private adjustDifficultyLevel(): void {
    if (this.playerPerformanceScore >= DifficultyManager.EXTREME_THRESHOLD) {
      this.currentDifficulty = DifficultyLevel.EXTREME;
    } else if (this.playerPerformanceScore >= DifficultyManager.HARD_THRESHOLD) {
      this.currentDifficulty = DifficultyLevel.HARD;
    } else if (this.playerPerformanceScore >= DifficultyManager.MEDIUM_THRESHOLD) {
      this.currentDifficulty = DifficultyLevel.MEDIUM;
    } else {
      this.currentDifficulty = DifficultyLevel.EASY;
    }
  }

  /**
   * Gets the current difficulty settings
   * @returns Current difficulty settings
   */
  public getCurrentSettings(): DifficultySettings {
    return DifficultyManager.DIFFICULTY_SETTINGS[this.currentDifficulty];
  }

  /**
   * Gets the current difficulty level
   * @returns Current difficulty level
   */
  public getCurrentLevel(): DifficultyLevel {
    return this.currentDifficulty;
  }

  /**
   * Manually sets the difficulty level
   * @param level Difficulty level to set
   */
  public setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level;
  }

  /**
   * Resets the difficulty manager to initial state
   */
  public reset(): void {
    this.currentDifficulty = DifficultyLevel.EASY;
    this.playerPerformanceScore = 0;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Gets the current performance score
   * @returns Current performance score
   */
  public getPerformanceScore(): number {
    return this.playerPerformanceScore;
  }
}