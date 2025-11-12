/**
 * Feature: Video Suggestions Blocker
 * Hides suggestion feeds while watching videos
 */

class SuggestionsBlocker {
  constructor(core) {
    this.core = core;
    this.enabled = false; // Default to disabled
    this.featureName = 'suggestionsBlocked';
    this.defaultValue = false; // Default disabled
  }

  isEnabled() {
    return this.enabled;
  }

  isWatchPage() {
    return (
      location.pathname.startsWith('/watch') ||
      location.pathname.includes('/watch?v=')
    );
  }

  hideSuggestions() {
    if (!this.isWatchPage() || !this.enabled) {
      return;
    }

    try {
      // Hide the items container in the secondary results
      const items = document.querySelector('#items.style-scope.ytd-watch-next-secondary-results-renderer');
      if (items) {
        items.style.display = 'none';
      }
    } catch (error) {
      console.error('[YouTube Blocker] Error hiding suggestions:', error);
    }
  }

  showSuggestions() {
    // Restore the items container
    const items = document.querySelector('#items.style-scope.ytd-watch-next-secondary-results-renderer');
    if (items) {
      items.style.display = '';
    }
  }

  applyState(state) {
    const wasEnabled = this.enabled;
    this.enabled = state ?? false;

    if (this.enabled) {
      this.hideSuggestions();
      this.core.ensureObserver(this.featureName, () => {
        this.hideSuggestions();
      });
    } else {
      this.core.disconnectObserver(this.featureName);
      this.showSuggestions();
    }
  }

  init() {
    // Watch for navigation to watch page
    window.addEventListener('yt-navigate-finish', () => {
      if (this.enabled && this.isWatchPage()) {
        // Small delay to let YouTube render content first
        setTimeout(() => this.hideSuggestions(), 100);
      } else if (!this.enabled && this.isWatchPage()) {
        // Restore when navigating to watch page with feature disabled
        this.showSuggestions();
      }
    });
  }
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuggestionsBlocker;
} else {
  window.SuggestionsBlocker = SuggestionsBlocker;
}

