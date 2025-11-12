/**
 * Comments Blocker Module
 * Hides the comments section on YouTube videos
 */

class CommentsBlocker {
  constructor(core) {
    this.core = core;
    this.enabled = false; // Default to disabled
    this.featureName = 'commentsBlocked';
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

  hideComments() {
    if (!this.isWatchPage() || !this.enabled) {
      return;
    }

    try {
      // Hide comments section using the section-identifier attribute
      const commentsSection = document.querySelector('[section-identifier="comment-item-section"]');
      if (commentsSection) {
        commentsSection.style.display = 'none';
      }

      // Also hide the comments header/title
      const commentsHeader = document.querySelector('ytd-comments#comments');
      if (commentsHeader) {
        commentsHeader.style.display = 'none';
      }

      // Hide the entire comments renderer
      const commentsRenderer = document.querySelector('ytd-comments');
      if (commentsRenderer) {
        commentsRenderer.style.display = 'none';
      }
    } catch (error) {
      console.error('[YouTube Blocker] Error hiding comments:', error);
    }
  }

  showComments() {
    try {
      // Restore comments section
      const commentsSection = document.querySelector('[section-identifier="comment-item-section"]');
      if (commentsSection) {
        commentsSection.style.display = '';
      }

      // Restore comments header
      const commentsHeader = document.querySelector('ytd-comments#comments');
      if (commentsHeader) {
        commentsHeader.style.display = '';
      }

      // Restore comments renderer
      const commentsRenderer = document.querySelector('ytd-comments');
      if (commentsRenderer) {
        commentsRenderer.style.display = '';
      }
    } catch (error) {
      console.error('[YouTube Blocker] Error showing comments:', error);
    }
  }

  applyState(state) {
    this.enabled = state ?? false;

    if (this.enabled) {
      this.hideComments();
      this.core.ensureObserver(this.featureName, () => {
        this.hideComments();
      });
    } else {
      this.core.disconnectObserver(this.featureName);
      this.showComments();
    }
  }

  init() {
    // Watch for navigation to video pages
    window.addEventListener('yt-navigate-finish', () => {
      if (this.enabled && this.isWatchPage()) {
        // Small delay to let YouTube render content first
        setTimeout(() => this.hideComments(), 100);
      } else if (!this.enabled && this.isWatchPage()) {
        this.showComments();
      }
    });
  }
}

