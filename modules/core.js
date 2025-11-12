/**
 * Core utilities for managing extension state and DOM observation
 */

const DEFAULT_STATE = true;

class ExtensionCore {
  constructor() {
    this.observers = new Map();
    this.features = new Map();
  }

  /**
   * Register a feature module
   */
  registerFeature(name, feature) {
    this.features.set(name, feature);
  }

  /**
   * Get stored state for a feature
   */
  async getStoredState(featureName, defaultValue = DEFAULT_STATE) {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(featureName, (result) => {
          if (chrome.runtime.lastError) {
            console.warn(`[YouTube Blocker] Storage read error for ${featureName}:`, chrome.runtime.lastError);
            resolve(defaultValue);
            return;
          }
          resolve(
            typeof result[featureName] === 'undefined'
              ? defaultValue
              : result[featureName]
          );
        });
      } catch (error) {
        console.error(`[YouTube Blocker] Failed to get state for ${featureName}:`, error);
        resolve(defaultValue);
      }
    });
  }

  /**
   * Set stored state for a feature
   */
  async setStoredState(featureName, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [featureName]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }

  /**
   * Ensure a MutationObserver is active for a feature
   */
  ensureObserver(featureName, callback) {
    if (this.observers.has(featureName)) {
      return;
    }

    // If body doesn't exist yet, wait for it
    if (!document.body) {
      const checkBody = () => {
        if (document.body) {
          this.setupObserver(featureName, callback);
        } else {
          setTimeout(checkBody, 50);
        }
      };
      checkBody();
      return;
    }

    this.setupObserver(featureName, callback);
  }

  /**
   * Setup the actual observer
   */
  setupObserver(featureName, callback) {
    if (this.observers.has(featureName) || !document.body) {
      return;
    }

    try {
      const observer = new MutationObserver(() => {
        try {
          const feature = this.features.get(featureName);
          if (feature && feature.isEnabled()) {
            callback();
          }
        } catch (error) {
          console.error(`[YouTube Blocker] Observer callback error for ${featureName}:`, error);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      this.observers.set(featureName, observer);
    } catch (error) {
      console.error(`[YouTube Blocker] Failed to setup observer for ${featureName}:`, error);
    }
  }

  /**
   * Disconnect observer for a feature
   */
  disconnectObserver(featureName) {
    const observer = this.observers.get(featureName);
    if (observer) {
      observer.disconnect();
      this.observers.delete(featureName);
    }
  }

  /**
   * Apply state to all features
   */
  async applyStateToAll() {
    for (const [name, feature] of this.features) {
      // Get default value from feature if it has one
      const defaultValue = feature.defaultValue !== undefined 
        ? feature.defaultValue 
        : DEFAULT_STATE;
      const state = await this.getStoredState(name, defaultValue);
      feature.applyState(state);
    }
  }

  /**
   * Handle messages from background script
   */
  handleMessage(message) {
    if (message?.type === 'feature-state') {
      const feature = this.features.get(message.feature);
      if (feature) {
        feature.applyState(!!message.enabled);
      }
    }
  }
}

// Export singleton instance with a different name to avoid conflicts
const coreInstance = new ExtensionCore();

// Listen for messages
chrome.runtime.onMessage.addListener((message) => {
  coreInstance.handleMessage(message);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = coreInstance;
} else {
  window.YouTubeBlockerCore = coreInstance;
}

