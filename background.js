/**
 * Background service worker
 * Manages extension state and syncs changes to content scripts
 */

const DEFAULT_STATE = true;
const FEATURES = ['shortsBlocked', 'homepageFeedsBlocked', 'suggestionsBlocked'];

// Initialize default states on install and migrate old storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([...FEATURES, 'enabled'], (result) => {
    const updates = {};
    
    // Migrate old 'enabled' key to 'shortsBlocked'
    if (typeof result.enabled !== 'undefined' && typeof result.shortsBlocked === 'undefined') {
      updates.shortsBlocked = result.enabled;
    }
    
    FEATURES.forEach((feature) => {
      if (typeof result[feature] === 'undefined') {
        // Shorts blocker defaults to enabled, others to disabled
        updates[feature] = feature === 'shortsBlocked' ? DEFAULT_STATE : false;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates);
    }
  });
});

// Listen for storage changes and notify content scripts
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') {
    return;
  }

  // Notify content scripts of any feature state changes
  chrome.tabs.query({ url: '*://www.youtube.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id !== undefined) {
        Object.keys(changes).forEach((feature) => {
          if (FEATURES.includes(feature)) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: 'feature-state',
                feature,
                enabled: changes[feature].newValue,
              },
              () => chrome.runtime.lastError
            );
          }
        });
      }
    });
  });
});
