/**
 * @file EnemyWaveGenerator.ts
 * @description Service responsible for generating waves of enemies in the Space Invaders game
 */

export interface EnemyConfig {
  type: string;
  health: number;
  speed: number;
  points: number;
  size: {
    width: number;
    height: number;
  };
}

export interface WaveConfig {
  enemyCount: number;
  rows: number;
  columns: number;
  spacing: {
    horizontal: number;
    vertical: number;
  };
  enemyTypes: EnemyConfig[];
  movePattern: 'zigzag' | 'linear' | 'swooping';
  speedMultiplier: number;
}

export interface Enemy {
  id: string;
  type: string;
  position: { x: number; y: number };
  health: number;
  speed: number;
  points: number;
  size: { width: number; height: number };
}

export class EnemyWaveGenerator {
  private currentWave: number;
  private defaultWaveConfig: WaveConfig;
  private screenDimensions: { width: number; height: number };

  constructor(screenWidth: number, screenHeight: number) {
    this.currentWave = 0;
    this.screenDimensions = {
      width: screenWidth,
      height: screenHeight,
    };

    // Default configuration for waves
    this.defaultWaveConfig = {
      enemyCount: 24,
      rows: 4,
      columns: 6,
      spacing: {
        horizontal: 60,
        vertical: 50,
      },
      enemyTypes: [
        {
          type: 'basic',
          health: 1,
          speed: 1,
          points: 10,
          size: { width: 40, height: 40 },
        },
      ],
      movePattern: 'zigzag',
      speedMultiplier: 1,
    };
  }

  /**
   * Generates a new wave of enemies
   * @param customConfig Optional custom configuration for the wave
   * @returns Array of enemy objects
   */
  public generateWave(customConfig?: Partial<WaveConfig>): Enemy[] {
    this.currentWave++;
    const config = { ...this.defaultWaveConfig, ...customConfig };
    const enemies: Enemy[] = [];

    // Calculate starting position for the wave
    const totalWidth = config.columns * (config.spacing.horizontal + config.enemyTypes[0].size.width);
    const startX = (this.screenDimensions.width - totalWidth) / 2;
    const startY = 50; // Start from top of screen with padding

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const enemyType = this.selectEnemyType(config.enemyTypes, row);
        const enemy = this.createEnemy(
          enemyType,
          startX + col * config.spacing.horizontal,
          startY + row * config.spacing.vertical,
          config.speedMultiplier
        );
        enemies.push(enemy);
      }
    }

    return enemies;
  }

  /**
   * Creates a single enemy instance
   */
  private createEnemy(
    enemyConfig: EnemyConfig,
    x: number,
    y: number,
    speedMultiplier: number
  ): Enemy {
    return {
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: enemyConfig.type,
      position: { x, y },
      health: enemyConfig.health,
      speed: enemyConfig.speed * speedMultiplier,
      points: enemyConfig.points,
      size: { ...enemyConfig.size },
    };
  }

  /**
   * Selects appropriate enemy type based on row position
   */
  private selectEnemyType(enemyTypes: EnemyConfig[], row: number): EnemyConfig {
    if (enemyTypes.length === 1) return enemyTypes[0];
    const index = Math.min(row, enemyTypes.length - 1);
    return enemyTypes[index];
  }

  /**
   * Gets the current wave number
   */
  public getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Calculates difficulty multiplier based on current wave
   */
  public getDifficultyMultiplier(): number {
    return 1 + (this.currentWave - 1) * 0.1;
  }

  /**
   * Resets the wave counter
   */
  public reset(): void {
    this.currentWave = 0;
  }

  /**
   * Updates wave configuration based on current wave number
   */
  public getWaveConfig(): WaveConfig {
    const difficultyMultiplier = this.getDifficultyMultiplier();
    return {
      ...this.defaultWaveConfig,
      enemyCount: Math.floor(this.defaultWaveConfig.enemyCount * difficultyMultiplier),
      speedMultiplier: difficultyMultiplier,
    };
  }
}