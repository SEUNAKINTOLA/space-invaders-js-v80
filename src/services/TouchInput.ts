/**
 * TouchInput service for handling touch events in Space Invaders
 * @file src/services/TouchInput.ts
 */

export interface TouchPosition {
  x: number;
  y: number;
}

export interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
}

export class TouchInput {
  private touchStartPosition: TouchPosition | null = null;
  private touchStartTime: number = 0;
  private readonly touchThreshold: number = 20; // minimum distance for swipe detection
  private readonly tapThreshold: number = 200; // maximum duration for tap detection in ms
  
  private isTouching: boolean = false;
  private touchCallbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeTouchEvents();
  }

  /**
   * Initialize touch event listeners
   * @private
   */
  private initializeTouchEvents(): void {
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
  }

  /**
   * Handle touch start event
   * @private
   * @param event TouchEvent
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      this.isTouching = true;
      this.touchStartTime = Date.now();
      this.touchStartPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      this.emit('touchStart', this.touchStartPosition);
    }
  }

  /**
   * Handle touch move event
   * @private
   * @param event TouchEvent
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (this.isTouching && this.touchStartPosition) {
      const currentPosition: TouchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      
      this.emit('touchMove', {
        current: currentPosition,
        start: this.touchStartPosition
      });
    }
  }

  /**
   * Handle touch end event
   * @private
   * @param event TouchEvent
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    if (this.touchStartPosition) {
      const endPosition: TouchPosition = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      };

      const gesture = this.analyzeGesture(endPosition);
      this.processGesture(gesture);
      
      this.isTouching = false;
      this.touchStartPosition = null;
      this.emit('touchEnd', endPosition);
    }
  }

  /**
   * Analyze touch gesture
   * @private
   * @param endPosition TouchPosition
   * @returns TouchGesture
   */
  private analyzeGesture(endPosition: TouchPosition): TouchGesture {
    if (!this.touchStartPosition) {
      throw new Error('Touch start position is null');
    }

    const deltaX = endPosition.x - this.touchStartPosition.x;
    const deltaY = endPosition.y - this.touchStartPosition.y;
    const duration = Date.now() - this.touchStartTime;

    return {
      startX: this.touchStartPosition.x,
      startY: this.touchStartPosition.y,
      endX: endPosition.x,
      endY: endPosition.y,
      deltaX,
      deltaY,
      duration
    };
  }

  /**
   * Process touch gesture and emit appropriate events
   * @private
   * @param gesture TouchGesture
   */
  private processGesture(gesture: TouchGesture): void {
    const { deltaX, deltaY, duration } = gesture;
    
    // Handle tap
    if (Math.abs(deltaX) < this.touchThreshold && 
        Math.abs(deltaY) < this.touchThreshold && 
        duration < this.tapThreshold) {
      this.emit('tap', gesture);
      return;
    }

    // Handle swipes
    if (Math.abs(deltaX) > this.touchThreshold) {
      if (deltaX > 0) {
        this.emit('swipeRight', gesture);
      } else {
        this.emit('swipeLeft', gesture);
      }
    }

    if (Math.abs(deltaY) > this.touchThreshold) {
      if (deltaY > 0) {
        this.emit('swipeDown', gesture);
      } else {
        this.emit('swipeUp', gesture);
      }
    }
  }

  /**
   * Add event listener
   * @param eventName string
   * @param callback Function
   */
  public on(eventName: string, callback: Function): void {
    if (!this.touchCallbacks.has(eventName)) {
      this.touchCallbacks.set(eventName, []);
    }
    this.touchCallbacks.get(eventName)?.push(callback);
  }

  /**
   * Remove event listener
   * @param eventName string
   * @param callback Function
   */
  public off(eventName: string, callback: Function): void {
    const callbacks = this.touchCallbacks.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered callbacks
   * @private
   * @param eventName string
   * @param data any
   */
  private emit(eventName: string, data: any): void {
    const callbacks = this.touchCallbacks.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Clean up touch event listeners
   */
  public destroy(): void {
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.touchCallbacks.clear();
  }

  /**
   * Check if touch is currently active
   * @returns boolean
   */
  public isActive(): boolean {
    return this.isTouching;
  }
}