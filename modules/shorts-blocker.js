/**
 * Feature: YouTube Shorts Blocker
 * Removes Shorts UI elements and redirects /shorts/ URLs
 */

const SHORTS_HOME_SELECTOR =
  'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])';
const SHORTS_REEL_SELECTOR = 'ytd-reel-shelf-renderer';
const SHORTS_LINK_SELECTOR = 'a[href*="/shorts"]';
const SHORTS_GRID_RENDERER_SELECTOR =
  'ytd-rich-grid-media a[href*="/shorts/"]';
const SHORTS_VIDEO_RENDERER_SELECTOR =
  'ytd-video-renderer a[href*="/shorts/"]';

class ShortsBlocker {
  constructor(core) {
    this.core = core;
    this.enabled = true;
    this.featureName = 'shortsBlocked';
    this.defaultValue = true; // Default enabled
  }

  isEnabled() {
    return this.enabled;
  }

  hideShortsElements() {
    if (!this.enabled) {
      return;
    }

    try {
      // Hide Shorts shelf modules on the homepage
      document
        .querySelectorAll(SHORTS_HOME_SELECTOR)
        .forEach((el) => (el.style.display = 'none'));

      // Hide any reel shelf modules
      document
        .querySelectorAll(SHORTS_REEL_SELECTOR)
        .forEach((el) => (el.style.display = 'none'));

      // Hide individual Shorts entries within rich grid
      document
        .querySelectorAll(SHORTS_GRID_RENDERER_SELECTOR)
        .forEach((link) => {
          const parent = link.closest('ytd-rich-grid-media');
          if (parent) parent.style.display = 'none';
        });

      // Hide Shorts results from search or related videos
      document
        .querySelectorAll(SHORTS_VIDEO_RENDERER_SELECTOR)
        .forEach((link) => {
          const parent = link.closest('ytd-video-renderer');
          if (parent) parent.style.display = 'none';
        });

      // Hide direct navigation buttons to Shorts
      document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach((link) => {
        const entry =
          link.closest('ytd-guide-entry-renderer') ||
          link.closest('#endpoint, a');

        if (entry) {
          entry.style.display = 'none';
        } else {
          link.style.display = 'none';
        }
      });

      // Fallback: hide guide entries whose label text is exactly "Shorts"
      document.querySelectorAll('ytd-guide-entry-renderer').forEach((entry) => {
        const label = entry.querySelector('.title');
        if (label && label.textContent.trim().toLowerCase() === 'shorts') {
          entry.style.display = 'none';
        }
      });
    } catch (error) {
      console.error('[YouTube Blocker] Error hiding Shorts:', error);
    }
  }

  showShortsElements() {
    // Restore Shorts shelf modules
    document
      .querySelectorAll(SHORTS_HOME_SELECTOR)
      .forEach((el) => (el.style.display = ''));

    // Restore reel shelf modules
    document
      .querySelectorAll(SHORTS_REEL_SELECTOR)
      .forEach((el) => (el.style.display = ''));

    // Restore individual Shorts entries
    document
      .querySelectorAll(SHORTS_GRID_RENDERER_SELECTOR)
      .forEach((link) => {
        const parent = link.closest('ytd-rich-grid-media');
        if (parent) parent.style.display = '';
      });

    // Restore Shorts from search/related
    document
      .querySelectorAll(SHORTS_VIDEO_RENDERER_SELECTOR)
      .forEach((link) => {
        const parent = link.closest('ytd-video-renderer');
        if (parent) parent.style.display = '';
      });

    // Restore navigation buttons
    document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach((link) => {
      const entry =
        link.closest('ytd-guide-entry-renderer') ||
        link.closest('#endpoint, a');

      if (entry) {
        entry.style.display = '';
      } else {
        link.style.display = '';
      }
    });

    // Restore guide entries
    document.querySelectorAll('ytd-guide-entry-renderer').forEach((entry) => {
      const label = entry.querySelector('.title');
      if (label && label.textContent.trim().toLowerCase() === 'shorts') {
        entry.style.display = '';
      }
    });
  }

  enforceRedirect() {
    if (!this.enabled) {
      return;
    }

    if (location.pathname.startsWith('/shorts/')) {
      location.replace('https://www.youtube.com/');
    }
  }

  applyState(state) {
    this.enabled = state ?? true;

    if (this.enabled) {
      this.hideShortsElements();
      this.enforceRedirect();
      this.core.ensureObserver(this.featureName, () => {
        this.hideShortsElements();
      });
    } else {
      this.core.disconnectObserver(this.featureName);
      this.showShortsElements();
    }
  }

  init() {
    // Watch for navigation events
    ['yt-navigate-finish', 'yt-navigate-start'].forEach((eventName) => {
      window.addEventListener(
        eventName,
        () => this.enforceRedirect(),
        { capture: true }
      );
    });
    window.addEventListener('popstate', () => this.enforceRedirect());
    window.addEventListener('yt-navigate-finish', () => {
      if (this.enabled) {
        // Small delay to let YouTube render content first
        setTimeout(() => this.hideShortsElements(), 100);
      } else {
        this.showShortsElements();
      }
    });
  }
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortsBlocker;
} else {
  window.ShortsBlocker = ShortsBlocker;
}

