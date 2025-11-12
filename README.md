# YouTube Blocker Extension

A powerful Chrome extension that gives you control over your YouTube experience. Block Shorts, hide homepage feeds, and remove video suggestions with simple, instant toggles.

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green?logo=google-chrome)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](manifest.json)

## ✨ Features

### 🚫 Block Shorts
- Hide Shorts shelves, buttons, and video cards across YouTube
- Remove Shorts navigation from the sidebar
- Redirect `/shorts/` URLs to the homepage
- Works on homepage, search results, and related videos

### 🏠 Block Homepage Feeds
- Hide all video feeds on the YouTube homepage
- Clean, distraction-free homepage experience
- Perfect for focused browsing

### 📺 Block Video Suggestions
- Hide suggestion sidebar while watching videos
- Focus on the current video without distractions
- Works on all watch pages

### ⚡ Additional Features
- **Instant Toggle**: Enable/disable features without page refresh
- **Persistent State**: Settings sync across browser sessions via `chrome.storage.sync`
- **Multi-Tab Support**: Changes apply to all open YouTube tabs instantly
- **Lightweight**: Minimal performance impact with efficient DOM observation
- **Error Resilient**: Graceful error handling and fallback strategies

## 🚀 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/youtube-short-blocker.git
   cd youtube-short-blocker
   ```

2. **Load the extension**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `youtube-short-blocker` folder

3. **Verify installation**
   - You should see the extension icon in your toolbar
   - Visit YouTube to confirm it's working

### From Chrome Web Store (Coming Soon)

*Extension will be available on the Chrome Web Store soon.*

## 📖 Usage

1. **Open the extension popup** by clicking the extension icon in your toolbar
2. **Toggle features** using the switches:
   - **Block Shorts**: Hides all Shorts content (enabled by default)
   - **Block Homepage Feeds**: Hides all feeds on the homepage
   - **Block Suggestions**: Hides suggestions while watching videos
3. **Changes apply instantly** - no page refresh needed!

## 🏗️ Project Structure

```
youtube-short-blocker/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Background service worker
├── content.js                 # Main content script orchestrator
├── modules/                   # Feature modules
│   ├── core.js               # Core utilities and state management
│   ├── shorts-blocker.js     # Shorts blocking feature
│   ├── homepage-feeds.js     # Homepage feed blocking
│   └── suggestions.js        # Video suggestions blocking
├── popup/                     # Extension popup UI
│   ├── popup.html            # Popup markup
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── icons/                     # Extension icons
│   └── icon128.png
└── README.md                 # This file
```

## 🛠️ Development

### Prerequisites

- Chrome or Chromium-based browser (version 88+)
- Basic knowledge of JavaScript and Chrome Extensions API

### Architecture

The extension uses a **modular architecture** for easy maintenance and feature additions:

- **Core Module** (`modules/core.js`): Manages state, storage, and DOM observation
- **Feature Modules**: Self-contained feature implementations
  - Each feature is a class with `applyState()`, `init()`, and `isEnabled()` methods
  - Features register themselves with the core for centralized management

### Adding a New Feature

1. **Create a new module** in `modules/your-feature.js`:
   ```javascript
   class YourFeature {
     constructor(core) {
       this.core = core;
       this.enabled = false;
       this.featureName = 'yourFeatureName';
       this.defaultValue = false;
     }
     
     isEnabled() { return this.enabled; }
     
     applyState(state) {
       this.enabled = state ?? false;
       if (this.enabled) {
         // Enable feature
         this.core.ensureObserver(this.featureName, () => {
           // Your blocking logic
         });
       } else {
         this.core.disconnectObserver(this.featureName);
         // Disable feature
       }
     }
     
     init() {
       // Setup event listeners
     }
   }
   ```

2. **Register in `content.js`**:
   ```javascript
   const yourFeature = new YourFeature(core);
   core.registerFeature('yourFeatureName', yourFeature);
   ```

3. **Add toggle in `popup/popup.html`** and `popup/popup.js`

4. **Update `background.js`** to include the new feature in `FEATURES` array

### Code Style

- Use modern JavaScript (ES6+)
- Follow existing code patterns
- Add error handling with try-catch blocks
- Include comments for complex logic
- Use descriptive variable names

### Testing

1. **Manual Testing**:
   - Test each feature toggle on/off
   - Navigate between different YouTube pages
   - Test with multiple tabs open
   - Verify state persistence after browser restart

2. **Debug Mode**:
   - Open browser DevTools (F12)
   - Check Console for `[YouTube Blocker]` prefixed logs
   - Inspect elements to verify selectors work

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Browser version and OS
   - Screenshots if applicable
   - Console errors (F12 → Console)

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the code style
   - Add comments for complex logic
   - Test thoroughly
4. **Commit your changes**:
   ```bash
   git commit -m "Add: Description of your changes"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** with a clear description

### Contribution Ideas

- 🐛 Bug fixes
- ✨ New blocking features (Live streams, Mixes, etc.)
- 🎨 UI/UX improvements
- 📱 Firefox support
- 🌐 Internationalization
- ⚡ Performance optimizations
- 📝 Documentation improvements
- 🧪 Automated testing

## 🐛 Troubleshooting

### Features Not Working

**Problem**: Toggles don't have any effect

**Solutions**:
1. Reload the extension in `chrome://extensions`
2. Refresh the YouTube page
3. Check browser console for errors (F12)
4. Verify extension has necessary permissions

### State Not Persisting

**Problem**: Settings reset after closing browser

**Solutions**:
1. Check Chrome sync is enabled
2. Verify storage permission is granted
3. Clear extension storage and reconfigure

### Selectors Not Working

**Problem**: Some elements still visible after YouTube update

**Solutions**:
1. YouTube may have changed their HTML structure
2. Inspect the element in DevTools
3. Update selectors in the relevant module file
4. Submit a PR with the fix!

### Performance Issues

**Problem**: Extension slows down YouTube

**Solutions**:
1. Disable features you don't use
2. Check for conflicts with other extensions
3. Report the issue with performance metrics

## 📋 Roadmap

### Planned Features

- [ ] Firefox/Manifest V2 support
- [ ] Block Live streams option
- [ ] Block Mixes/Playlists option
- [ ] Whitelist specific channels
- [ ] Temporary disable timers
- [ ] Statistics dashboard
- [ ] Keyboard shortcuts
- [ ] Dark mode for popup
- [ ] Per-site settings
- [ ] Export/import settings

### Known Limitations

- Elements are hidden (not removed) from DOM, so they still load
- Some YouTube A/B test variations may not be fully supported
- Requires Chrome 88+ for Manifest V3 support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Inspired by the need for a distraction-free YouTube experience
- Thanks to all contributors and users!

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/youtube-short-blocker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/youtube-short-blocker/discussions)

---

**Made with ❤️ for a better YouTube experience**
# YouTube-Blocker-Extension
