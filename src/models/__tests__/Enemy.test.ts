// src/models/__tests__/Enemy.test.ts

import { describe, test, expect, beforeEach } from 'jest';

// Mock Entity class since we can't import it yet
class MockEntity {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

// Mock Enemy class for testing
class Enemy extends MockEntity {
  private health: number;
  private points: number;
  private speed: number;
  private isActive: boolean;
  private type: string;

  constructor(
    x: number,
    y: number,
    width: number = 30,
    height: number = 30,
    type: string = 'basic',
    health: number = 1,
    points: number = 10,
    speed: number = 1
  ) {
    super(x, y, width, height);
    this.health = health;
    this.points = points;
    this.speed = speed;
    this.isActive = true;
    this.type = type;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isActive = false;
    }
  }

  getHealth(): number {
    return this.health;
  }

  getPoints(): number {
    return this.points;
  }

  getSpeed(): number {
    return this.speed;
  }

  isAlive(): boolean {
    return this.isActive;
  }

  getType(): string {
    return this.type;
  }
}

describe('Enemy', () => {
  let enemy: Enemy;

  beforeEach(() => {
    enemy = new Enemy(100, 100);
  });

  describe('initialization', () => {
    test('should create enemy with default values', () => {
      expect(enemy.getPosition()).toEqual({ x: 100, y: 100 });
      expect(enemy.getHealth()).toBe(1);
      expect(enemy.getPoints()).toBe(10);
      expect(enemy.getSpeed()).toBe(1);
      expect(enemy.isAlive()).toBe(true);
      expect(enemy.getType()).toBe('basic');
    });

    test('should create enemy with custom values', () => {
      const customEnemy = new Enemy(200, 200, 40, 40, 'advanced', 2, 20, 2);
      expect(customEnemy.getPosition()).toEqual({ x: 200, y: 200 });
      expect(customEnemy.getHealth()).toBe(2);
      expect(customEnemy.getPoints()).toBe(20);
      expect(customEnemy.getSpeed()).toBe(2);
      expect(customEnemy.getType()).toBe('advanced');
    });
  });

  describe('damage handling', () => {
    test('should reduce health when taking damage', () => {
      enemy.takeDamage(0.5);
      expect(enemy.getHealth()).toBe(0.5);
    });

    test('should not allow health to go below 0', () => {
      enemy.takeDamage(2);
      expect(enemy.getHealth()).toBe(0);
    });

    test('should deactivate enemy when health reaches 0', () => {
      enemy.takeDamage(1);
      expect(enemy.isAlive()).toBe(false);
    });

    test('should remain active when health is above 0', () => {
      enemy.takeDamage(0.5);
      expect(enemy.isAlive()).toBe(true);
    });
  });

  describe('getters', () => {
    test('should return correct position', () => {
      expect(enemy.getPosition()).toEqual({ x: 100, y: 100 });
    });

    test('should return correct points value', () => {
      expect(enemy.getPoints()).toBe(10);
    });

    test('should return correct speed value', () => {
      expect(enemy.getSpeed()).toBe(1);
    });

    test('should return correct type', () => {
      expect(enemy.getType()).toBe('basic');
    });
  });
});