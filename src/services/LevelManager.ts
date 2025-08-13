/**
 * @file LevelManager.ts
 * @description Manages game level progression, difficulty scaling, and level-specific configurations
 */

export interface LevelConfig {
  levelNumber: number;
  enemySpeed: number;
  enemyCount: number;
  enemyRows: number;
  enemyColumns: number;
  specialEnemyChance: number;
  powerUpFrequency: number;
  bossLevel: boolean;
}

export class LevelManager {
  private currentLevel: number;
  private maxLevel: number;
  private levelConfigs: Map<number, LevelConfig>;
  private isLevelComplete: boolean;

  /**
   * Initializes the LevelManager with default configurations
   * @param startLevel - Starting level number (default: 1)
   * @param maxLevel - Maximum available level (default: 10)
   */
  constructor(startLevel: number = 1, maxLevel: number = 10) {
    this.currentLevel = startLevel;
    this.maxLevel = maxLevel;
    this.levelConfigs = new Map();
    this.isLevelComplete = false;
    
    this.initializeLevelConfigs();
  }

  /**
   * Initializes default level configurations with progressive difficulty
   * @private
   */
  private initializeLevelConfigs(): void {
    for (let level = 1; level <= this.maxLevel; level++) {
      const config: LevelConfig = {
        levelNumber: level,
        enemySpeed: this.calculateEnemySpeed(level),
        enemyCount: this.calculateEnemyCount(level),
        enemyRows: Math.min(3 + Math.floor(level / 2), 6),
        enemyColumns: Math.min(6 + Math.floor(level / 3), 10),
        specialEnemyChance: Math.min(0.1 * level, 0.5),
        powerUpFrequency: Math.max(0.5 - (level * 0.03), 0.1),
        bossLevel: level % 5 === 0, // Boss levels every 5 levels
      };
      
      this.levelConfigs.set(level, config);
    }
  }

  /**
   * Calculates enemy speed based on level number
   * @private
   * @param level - Current level number
   * @returns Calculated enemy speed
   */
  private calculateEnemySpeed(level: number): number {
    const baseSpeed = 1.0;
    const speedIncrease = 0.2;
    return baseSpeed + (level - 1) * speedIncrease;
  }

  /**
   * Calculates enemy count based on level number
   * @private
   * @param level - Current level number
   * @returns Calculated enemy count
   */
  private calculateEnemyCount(level: number): number {
    const baseCount = 12;
    const countIncrease = 4;
    return Math.min(baseCount + (level - 1) * countIncrease, 50);
  }

  /**
   * Gets the current level configuration
   * @returns Current level configuration
   * @throws Error if current level configuration is not found
   */
  public getCurrentLevelConfig(): LevelConfig {
    const config = this.levelConfigs.get(this.currentLevel);
    if (!config) {
      throw new Error(`Level configuration not found for level ${this.currentLevel}`);
    }
    return config;
  }

  /**
   * Advances to the next level if available
   * @returns True if advanced to next level, false if at max level
   */
  public advanceLevel(): boolean {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.isLevelComplete = false;
      return true;
    }
    return false;
  }

  /**
   * Marks the current level as complete
   */
  public setLevelComplete(): void {
    this.isLevelComplete = true;
  }

  /**
   * Checks if the current level is complete
   * @returns True if current level is complete
   */
  public isCurrentLevelComplete(): boolean {
    return this.isLevelComplete;
  }

  /**
   * Gets the current level number
   * @returns Current level number
   */
  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * Checks if the current level is a boss level
   * @returns True if current level is a boss level
   */
  public isBossLevel(): boolean {
    return this.getCurrentLevelConfig().bossLevel;
  }

  /**
   * Resets the level manager to initial state
   * @param startLevel - Level to reset to (default: 1)
   */
  public reset(startLevel: number = 1): void {
    this.currentLevel = startLevel;
    this.isLevelComplete = false;
  }

  /**
   * Gets the maximum available level
   * @returns Maximum level number
   */
  public getMaxLevel(): number {
    return this.maxLevel;
  }
}