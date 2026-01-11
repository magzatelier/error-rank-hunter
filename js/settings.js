/* ============================================================
   SETTINGS.JS - Theme Toggle & Font Size Controls
   ============================================================
   This file handles:
   - Dark/Light theme switching with localStorage persistence
   - Font size adjustment with localStorage persistence
   - Settings panel open/close behavior
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  
  const STORAGE_KEYS = {
    theme: 'story-theme',
    fontSize: 'story-font-size'
  };

  const FONT_SIZES = ['small', 'normal', 'large', 'x-large'];
  const THEMES = ['light', 'dark'];
  const DEFAULT_THEME = 'light';
  const DEFAULT_FONT_SIZE = 'normal';

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  /**
   * Initialize settings on page load
   * This runs immediately to prevent flash of wrong theme
   */
  function initSettings() {
    // Apply saved theme (or detect from system preference)
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme && THEMES.includes(savedTheme)) {
      setTheme(savedTheme, false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light', false);
    }

    // Apply saved font size
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.fontSize);
    if (savedFontSize && FONT_SIZES.includes(savedFontSize)) {
      setFontSize(savedFontSize, false);
    } else {
      setFontSize(DEFAULT_FONT_SIZE, false);
    }
  }

  // Run initialization immediately (before DOM is fully loaded)
  // This prevents flash of unstyled/wrong-themed content
  initSettings();

  // ============================================================
  // THEME FUNCTIONS
  // ============================================================

  /**
   * Set the color theme
   * @param {string} theme - 'light' or 'dark'
   * @param {boolean} save - Whether to save to localStorage (default: true)
   */
  function setTheme(theme, save = true) {
    if (!THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    // Apply theme to HTML element
    document.documentElement.setAttribute('data-theme', theme);

    // Save preference
    if (save) {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    }

    // Update toggle buttons if they exist
    updateThemeButtons(theme);

    // Dispatch custom event for other scripts that might need to know
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  /**
   * Get the current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  /**
   * Update theme toggle buttons to show active state
   * @param {string} theme - Current theme
   */
  function updateThemeButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme');
      btn.classList.toggle('is-active', btnTheme === theme);
    });
  }

  // ============================================================
  // FONT SIZE FUNCTIONS
  // ============================================================

  /**
   * Set the font size
   * @param {string} size - One of: 'small', 'normal', 'large', 'x-large'
   * @param {boolean} save - Whether to save to localStorage (default: true)
   */
  function setFontSize(size, save = true) {
    if (!FONT_SIZES.includes(size)) {
      console.warn(`Invalid font size: ${size}`);
      return;
    }

    // Apply font size to HTML element
    document.documentElement.setAttribute('data-font-size', size);

    // Save preference
    if (save) {
      localStorage.setItem(STORAGE_KEYS.fontSize, size);
    }

    // Update buttons if they exist
    updateFontSizeButtons(size);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('fontsizechange', { detail: { size } }));
  }

  /**
   * Increase font size by one step
   */
  function increaseFontSize() {
    const currentIndex = FONT_SIZES.indexOf(getFontSize());
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  }

  /**
   * Decrease font size by one step
   */
  function decreaseFontSize() {
    const currentIndex = FONT_SIZES.indexOf(getFontSize());
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  }

  /**
   * Get the current font size
   * @returns {string} Current font size
   */
  function getFontSize() {
    return document.documentElement.getAttribute('data-font-size') || DEFAULT_FONT_SIZE;
  }

  /**
   * Update font size buttons to show active state
   * @param {string} size - Current font size
   */
  function updateFontSizeButtons(size) {
    document.querySelectorAll('.font-size-btn').forEach(btn => {
      const btnSize = btn.getAttribute('data-size');
      btn.classList.toggle('is-active', btnSize === size);
    });
  }

  // ============================================================
  // SETTINGS PANEL
  // ============================================================

  /**
   * Toggle the settings panel open/closed
   * @param {boolean} [forceState] - Force open (true) or closed (false)
   */
  function toggleSettingsPanel(forceState) {
    const panel = document.querySelector('.settings-panel');
    if (!panel) return;

    const isOpen = panel.classList.contains('is-open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;

    panel.classList.toggle('is-open', shouldOpen);

    // Update ARIA attributes
    const trigger = document.querySelector('.settings-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', shouldOpen.toString());
    }
  }

  /**
   * Close settings panel when clicking outside
   */
  function handleOutsideClick(event) {
    const panel = document.querySelector('.settings-panel');
    const dropdown = document.querySelector('.settings-dropdown');
    
    if (panel && panel.classList.contains('is-open')) {
      if (dropdown && !dropdown.contains(event.target)) {
        toggleSettingsPanel(false);
      }
    }
  }

  // ============================================================
  // EVENT LISTENERS SETUP
  // ============================================================

  /**
   * Set up all event listeners once DOM is ready
   */
  function setupEventListeners() {
    // Settings panel toggle
    document.querySelectorAll('.settings-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettingsPanel();
      });
    });

    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        if (theme) setTheme(theme);
      });
    });

    // Font size buttons
    document.querySelectorAll('.font-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size');
        if (size) setFontSize(size);
      });
    });

    // Close panel when clicking outside
    document.addEventListener('click', handleOutsideClick);

    // Close panel on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleSettingsPanel(false);
      }
    });

    // Listen for system theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      if (!localStorage.getItem(STORAGE_KEYS.theme)) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    });

    // Update UI to reflect current settings
    updateThemeButtons(getTheme());
    updateFontSizeButtons(getFontSize());
  }

  // Set up listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  // Expose functions globally for use in HTML onclick attributes if needed
  window.StorySettings = {
    setTheme,
    toggleTheme,
    getTheme,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    getFontSize,
    toggleSettingsPanel
  };

})();
