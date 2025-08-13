/**
 * @file BrowserDetection.ts
 * @description Utility class for browser detection and compatibility checking
 * for Space Invaders JS V80. Provides methods to detect browser type, version,
 * and check for required game features.
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  isMobile: boolean;
  features: {
    webGL: boolean;
    webAudio: boolean;
    localStorage: boolean;
    requestAnimationFrame: boolean;
  };
}

export class BrowserDetection {
  private static instance: BrowserDetection;
  private cachedInfo: BrowserInfo | null = null;

  private constructor() {}

  /**
   * Get singleton instance of BrowserDetection
   */
  public static getInstance(): BrowserDetection {
    if (!BrowserDetection.instance) {
      BrowserDetection.instance = new BrowserDetection();
    }
    return BrowserDetection.instance;
  }

  /**
   * Get detailed information about the current browser environment
   * @returns BrowserInfo object containing browser details and feature support
   */
  public getBrowserInfo(): BrowserInfo {
    if (this.cachedInfo) {
      return this.cachedInfo;
    }

    const userAgent = navigator.userAgent;
    const browserData = this.parseBrowserInfo(userAgent);
    
    const info: BrowserInfo = {
      name: browserData.name,
      version: browserData.version,
      isSupported: this.checkBrowserSupport(browserData),
      isMobile: this.checkIfMobile(),
      features: this.detectFeatures()
    };

    this.cachedInfo = info;
    return info;
  }

  /**
   * Check if the current browser meets minimum game requirements
   * @returns boolean indicating if the browser is supported
   */
  public isSupported(): boolean {
    return this.getBrowserInfo().isSupported;
  }

  /**
   * Parse user agent string to determine browser name and version
   * @param userAgent - Browser user agent string
   * @returns Object containing browser name and version
   */
  private parseBrowserInfo(userAgent: string): { name: string; version: string } {
    // Chrome
    let match = userAgent.match(/Chrome\/([0-9.]+)/);
    if (match) return { name: 'Chrome', version: match[1] };

    // Firefox
    match = userAgent.match(/Firefox\/([0-9.]+)/);
    if (match) return { name: 'Firefox', version: match[1] };

    // Safari
    match = userAgent.match(/Version\/([0-9.]+).*Safari/);
    if (match) return { name: 'Safari', version: match[1] };

    // Edge
    match = userAgent.match(/Edg\/([0-9.]+)/);
    if (match) return { name: 'Edge', version: match[1] };

    // Default/Unknown
    return { name: 'Unknown', version: '0.0' };
  }

  /**
   * Detect availability of required browser features
   * @returns Object containing feature support information
   */
  private detectFeatures(): BrowserInfo['features'] {
    return {
      webGL: this.checkWebGLSupport(),
      webAudio: this.checkWebAudioSupport(),
      localStorage: this.checkLocalStorageSupport(),
      requestAnimationFrame: typeof window.requestAnimationFrame === 'function'
    };
  }

  /**
   * Check if the current device is mobile
   * @returns boolean indicating if the device is mobile
   */
  private checkIfMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
  }

  /**
   * Check WebGL support
   * @returns boolean indicating WebGL support
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Check Web Audio API support
   * @returns boolean indicating Web Audio support
   */
  private checkWebAudioSupport(): boolean {
    return typeof (window.AudioContext || (window as any).webkitAudioContext) !== 'undefined';
  }

  /**
   * Check localStorage support
   * @returns boolean indicating localStorage support
   */
  private checkLocalStorageSupport(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if the browser version meets minimum requirements
   * @param browserData Browser name and version information
   * @returns boolean indicating if the browser is supported
   */
  private checkBrowserSupport(browserData: { name: string; version: string }): boolean {
    const minVersions: { [key: string]: number } = {
      'Chrome': 80,
      'Firefox': 75,
      'Safari': 13,
      'Edge': 80
    };

    const majorVersion = parseInt(browserData.version.split('.')[0]);
    const minVersion = minVersions[browserData.name];

    if (!minVersion) return false;
    return majorVersion >= minVersion;
  }
}

// Export a default instance
export default BrowserDetection.getInstance();