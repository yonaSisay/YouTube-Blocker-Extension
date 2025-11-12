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
  comments: {
    key: 'commentsBlocked',
    default: false,
    toggleId: 'toggle-comments',
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
 * Get all feature states
 */
const getAllStates = async () => {
  const states = {};
  for (const [name, feature] of Object.entries(FEATURES)) {
    states[feature.key] = await getCurrentState(feature.key);
  }
  return states;
};

/**
 * Set all features to the same state
 */
const setAllStates = async (value) => {
  const updates = {};
  for (const [name, feature] of Object.entries(FEATURES)) {
    updates[feature.key] = value;
  }
  
  return new Promise((resolve) => {
    chrome.storage.sync.set(updates, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

/**
 * Update the Toggle All checkbox based on individual feature states
 */
const updateToggleAll = async () => {
  const toggleAll = document.getElementById('toggle-all');
  if (!toggleAll) return;

  const states = await getAllStates();
  const allEnabled = Object.values(states).every(state => state === true);
  const allDisabled = Object.values(states).every(state => state === false);

  // Set checked if all are enabled
  toggleAll.checked = allEnabled;
  
  // Make it indeterminate if some are on and some are off
  toggleAll.indeterminate = !allEnabled && !allDisabled;
};

/**
 * Initialize all toggles
 */
const initToggles = async () => {
  // Initialize individual feature toggles
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
      await updateToggleAll();
    });
  }

  // Initialize Toggle All
  const toggleAll = document.getElementById('toggle-all');
  if (toggleAll) {
    // Set initial state
    await updateToggleAll();

    // Add change listener
    toggleAll.addEventListener('change', async () => {
      const newState = toggleAll.checked;
      
      // Set all features to the new state
      await setAllStates(newState);
      
      // Update all individual toggles in the UI
      for (const [name, feature] of Object.entries(FEATURES)) {
        const toggle = document.getElementById(feature.toggleId);
        if (toggle) {
          toggle.checked = newState;
        }
      }
      
      // Remove indeterminate state
      toggleAll.indeterminate = false;
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initToggles().catch(error => {
    console.error('[YouTube Blocker] Initialization error:', error);
  });
});
