/**
 * Main content script orchestrator
 * Loads and manages all feature modules
 */

// Use the singleton core instance from core.js
if (!window.YouTubeBlockerCore) {
  console.error('[YouTube Blocker] YouTubeBlockerCore not found! Make sure modules/core.js loads first.');
}

const core = window.YouTubeBlockerCore;
const shortsBlocker = new ShortsBlocker(core);
const homepageFeedsBlocker = new HomepageFeedsBlocker(core);
const suggestionsBlocker = new SuggestionsBlocker(core);
const commentsBlocker = new CommentsBlocker(core);

// Register all features
core.registerFeature('shortsBlocked', shortsBlocker);
core.registerFeature('homepageFeedsBlocked', homepageFeedsBlocker);
core.registerFeature('suggestionsBlocked', suggestionsBlocker);
core.registerFeature('commentsBlocked', commentsBlocker);

// Initialize all features
const init = async () => {
  try {
    // Load states and apply
    await core.applyStateToAll();

    // Initialize feature-specific event listeners
    shortsBlocker.init();
    homepageFeedsBlocker.init();
    suggestionsBlocker.init();
    commentsBlocker.init();
  } catch (error) {
    console.error('[YouTube Blocker] Initialization error:', error);
  }
};

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  // DOM already ready, but wait a bit for YouTube to initialize
  setTimeout(init, 100);
}
