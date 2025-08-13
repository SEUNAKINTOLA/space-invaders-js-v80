/**
 * ScoreManager.ts
 * Manages game scoring system, including current score, high scores, and score multipliers.
 */

export interface ScoreConfig {
    basePoints: {
        [key: string]: number;
    };
    multiplierCap: number;
    comboTimeWindow: number;
}

export interface ScoreEvent {
    type: string;
    points: number;
    timestamp: number;
}

export class ScoreManager {
    private currentScore: number = 0;
    private highScore: number = 0;
    private scoreMultiplier: number = 1;
    private lastScoreTime: number = 0;
    private scoreHistory: ScoreEvent[] = [];
    private readonly config: ScoreConfig;

    constructor(config?: Partial<ScoreConfig>) {
        // Default configuration
        this.config = {
            basePoints: {
                'alien-basic': 100,
                'alien-advanced': 200,
                'alien-boss': 1000,
                'bonus-ship': 500,
            },
            multiplierCap: 4,
            comboTimeWindow: 2000, // 2 seconds
            ...config
        };

        this.loadHighScore();
    }

    /**
     * Adds points to the current score based on the event type
     * @param eventType - Type of scoring event
     * @returns The points awarded for this event
     */
    public addScore(eventType: string): number {
        const basePoints = this.config.basePoints[eventType] || 0;
        if (basePoints === 0) {
            console.warn(`Unknown score event type: ${eventType}`);
            return 0;
        }

        const now = Date.now();
        this.updateMultiplier(now);

        const pointsAwarded = Math.floor(basePoints * this.scoreMultiplier);
        this.currentScore += pointsAwarded;

        this.scoreHistory.push({
            type: eventType,
            points: pointsAwarded,
            timestamp: now
        });

        this.lastScoreTime = now;
        this.updateHighScore();

        return pointsAwarded;
    }

    /**
     * Updates the score multiplier based on timing of consecutive hits
     * @param currentTime - Current timestamp
     */
    private updateMultiplier(currentTime: number): void {
        const timeSinceLastScore = currentTime - this.lastScoreTime;
        
        if (timeSinceLastScore <= this.config.comboTimeWindow) {
            this.scoreMultiplier = Math.min(
                this.scoreMultiplier + 0.5,
                this.config.multiplierCap
            );
        } else {
            this.scoreMultiplier = 1;
        }
    }

    /**
     * Updates the high score if current score is higher
     */
    private updateHighScore(): void {
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
    }

    /**
     * Saves the high score to local storage
     */
    private saveHighScore(): void {
        try {
            localStorage.setItem('spaceInvaders.highScore', this.highScore.toString());
        } catch (error) {
            console.warn('Failed to save high score:', error);
        }
    }

    /**
     * Loads the high score from local storage
     */
    private loadHighScore(): void {
        try {
            const savedScore = localStorage.getItem('spaceInvaders.highScore');
            if (savedScore) {
                this.highScore = parseInt(savedScore, 10);
            }
        } catch (error) {
            console.warn('Failed to load high score:', error);
        }
    }

    /**
     * Resets the current score and multiplier
     */
    public resetScore(): void {
        this.currentScore = 0;
        this.scoreMultiplier = 1;
        this.lastScoreTime = 0;
        this.scoreHistory = [];
    }

    /**
     * Gets the current score
     */
    public getCurrentScore(): number {
        return this.currentScore;
    }

    /**
     * Gets the high score
     */
    public getHighScore(): number {
        return this.highScore;
    }

    /**
     * Gets the current score multiplier
     */
    public getCurrentMultiplier(): number {
        return this.scoreMultiplier;
    }

    /**
     * Gets the score history
     */
    public getScoreHistory(): ScoreEvent[] {
        return [...this.scoreHistory];
    }

    /**
     * Gets the base points for a specific event type
     * @param eventType - Type of scoring event
     */
    public getBasePoints(eventType: string): number {
        return this.config.basePoints[eventType] || 0;
    }
}