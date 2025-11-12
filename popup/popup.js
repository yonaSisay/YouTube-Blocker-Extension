/**
 * Popup UI controller
 * Manages toggles for all features
 */

const FEATURES = {
  shorts: {
    key: 'shortsBlocked',
    default: true,
    toggleId: 'toggle-shorts',
  },
  homepage: {
    key: 'homepageFeedsBlocked',
    default: false,
    toggleId: 'toggle-homepage',
  },
  suggestions: {
    key: 'suggestionsBlocked',
    default: false,
    toggleId: 'toggle-suggestions',
  },
};

/**
 * Get current state for a feature
 */
const getCurrentState = (featureKey) =>
  new Promise((resolve) => {
    chrome.storage.sync.get(featureKey, (result) => {
      const feature = Object.values(FEATURES).find((f) => f.key === featureKey);
      resolve(
        typeof result[featureKey] === 'undefined'
          ? feature?.default ?? false
          : result[featureKey]
      );
    });
  });

/**
 * Set state for a feature
 */
const setState = (featureKey, value) =>
  new Promise((resolve) => {
    chrome.storage.sync.set({ [featureKey]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      resolve();
    });
  });

/**
 * Initialize all toggles
 */
const initToggles = async () => {
  for (const [name, feature] of Object.entries(FEATURES)) {
    const toggle = document.getElementById(feature.toggleId);
    if (!toggle) {
      continue;
    }

    // Load current state
    const state = await getCurrentState(feature.key);
    toggle.checked = state;

    // Add change listener
    toggle.addEventListener('change', async () => {
      const newState = toggle.checked;
      await setState(feature.key, newState);
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initToggles);
