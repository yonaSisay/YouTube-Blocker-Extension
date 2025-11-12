/**
 * Feature: Homepage Feed Blocker
 * Hides all feed sections on the YouTube homepage
 */

class HomepageFeedsBlocker {
  constructor(core) {
    this.core = core;
    this.enabled = false; // Default to disabled
    this.featureName = 'homepageFeedsBlocked';
    this.defaultValue = false; // Default disabled
  }

  isEnabled() {
    return this.enabled;
  }

  isHomePage() {
    return (
      location.pathname === '/' ||
      location.pathname === '/feed' ||
      location.pathname === '/feed/'
    );
  }

  hideHomepageFeeds() {
    if (!this.isHomePage() || !this.enabled) {
      return;
    }

    try {
      // Hide the contents container instead of removing elements
      const contents = document.querySelector('#contents.style-scope.ytd-rich-grid-renderer');
      if (contents) {
        contents.style.display = 'none';
      }
    } catch (error) {
      console.error('[YouTube Blocker] Error hiding homepage feeds:', error);
    }
  }

  showHomepageFeeds() {
    // Restore the contents container
    const contents = document.querySelector('#contents.style-scope.ytd-rich-grid-renderer');
    if (contents) {
      contents.style.display = '';
    }
  }

  applyState(state) {
    const wasEnabled = this.enabled;
    this.enabled = state ?? false;

    if (this.enabled) {
      this.hideHomepageFeeds();
      this.core.ensureObserver(this.featureName, () => {
        this.hideHomepageFeeds();
      });
    } else {
      this.core.disconnectObserver(this.featureName);
      this.showHomepageFeeds();
    }
  }

  init() {
    // Watch for navigation to homepage
    window.addEventListener('yt-navigate-finish', () => {
      if (this.enabled && this.isHomePage()) {
        // Small delay to let YouTube render content first
        setTimeout(() => this.hideHomepageFeeds(), 100);
      } else if (!this.enabled && this.isHomePage()) {
        this.showHomepageFeeds();
      }
    });
  }
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomepageFeedsBlocker;
} else {
  window.HomepageFeedsBlocker = HomepageFeedsBlocker;
}

