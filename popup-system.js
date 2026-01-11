/* ============================================================
   POPUP-SYSTEM.JS - Multi-Mode Popup & Overlay System
   ============================================================
   This file handles three types of popups:
   
   SCENARIO A - Sequence Mode:
   - Full chapter experienced through sequential popups
   - Click/tap to advance to next popup
   - Used for Chapter 1 visual novel-style intro
   
   SCENARIO B - System Popups:
   - Intrusive notifications triggered by scrolling
   - Appear when reader reaches certain points in text
   - Sequential: must close one before next can appear
   - LitRPG system message aesthetic
   
   SCENARIO C - Document Viewer:
   - User-initiated overlay for viewing attachments
   - Click attachment link → document appears in overlay
   - Used for forum PDFs, images, articles
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // SHARED UTILITIES
  // ============================================================

  /**
   * Create the backdrop element if it doesn't exist
   */
  function getOrCreateBackdrop() {
    let backdrop = document.getElementById('popup-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'popup-backdrop';
      backdrop.className = 'popup-backdrop';
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  /**
   * Show the backdrop
   */
  function showBackdrop() {
    const backdrop = getOrCreateBackdrop();
    // Force reflow before adding class for transition
    backdrop.offsetHeight;
    backdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  /**
   * Hide the backdrop
   */
  function hideBackdrop() {
    const backdrop = getOrCreateBackdrop();
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = ''; // Restore scrolling
  }

  /**
   * Create close button SVG
   */
  function createCloseIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }

  // ============================================================
  // SCENARIO A: SEQUENCE POPUPS
  // ============================================================
  
  const SequencePopups = {
    items: [],
    currentIndex: 0,
    container: null,
    isActive: false,
    onComplete: null,

    /**
     * Initialize a popup sequence
     * @param {Array} items - Array of popup content objects
     *   Each item can have: { type: 'image'|'html', content: '...' }
     * @param {Function} onComplete - Callback when sequence ends
     */
    init(items, onComplete = null) {
      this.items = items;
      this.currentIndex = 0;
      this.onComplete = onComplete;
      this.isActive = true;

      this.createContainer();
      showBackdrop();
      this.showCurrentPopup();
      this.bindEvents();
    },

    /**
     * Create the popup container element
     */
    createContainer() {
      // Remove existing container if any
      const existing = document.getElementById('sequence-popup');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.id = 'sequence-popup';
      this.container.className = 'popup popup-sequence';
      this.container.setAttribute('role', 'dialog');
      this.container.setAttribute('aria-modal', 'true');
      document.body.appendChild(this.container);
    },

    /**
     * Show the current popup in the sequence
     */
    showCurrentPopup() {
      const item = this.items[this.currentIndex];
      if (!item) {
        this.complete();
        return;
      }

      let content = '';
      
      if (item.type === 'image') {
        content = `<img src="${item.content}" alt="${item.alt || 'Story image'}" />`;
      } else if (item.type === 'html') {
        content = item.content;
      }

      this.container.innerHTML = `
        <div class="popup-sequence-content">
          ${content}
          <div class="popup-sequence-continue">
            ${this.currentIndex < this.items.length - 1 ? 'Click to continue...' : 'Click to begin reading...'}
          </div>
        </div>
      `;

      // Animate in
      this.container.offsetHeight; // Force reflow
      this.container.classList.add('is-visible');
    },

    /**
     * Advance to the next popup
     */
    next() {
      // Animate out
      this.container.classList.remove('is-visible');
      
      setTimeout(() => {
        this.currentIndex++;
        if (this.currentIndex < this.items.length) {
          this.showCurrentPopup();
        } else {
          this.complete();
        }
      }, 300); // Match CSS transition duration
    },

    /**
     * Complete the sequence
     */
    complete() {
      this.isActive = false;
      this.container.classList.remove('is-visible');
      hideBackdrop();
      
      setTimeout(() => {
        this.container.remove();
        this.unbindEvents();
        if (this.onComplete) {
          this.onComplete();
        }
      }, 300);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
      this._handleClick = (e) => {
        if (this.isActive) {
          this.next();
        }
      };

      this._handleKeydown = (e) => {
        if (this.isActive && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
          e.preventDefault();
          this.next();
        }
      };

      document.addEventListener('click', this._handleClick);
      document.addEventListener('keydown', this._handleKeydown);
    },

    /**
     * Unbind event listeners
     */
    unbindEvents() {
      document.removeEventListener('click', this._handleClick);
      document.removeEventListener('keydown', this._handleKeydown);
    }
  };

  // ============================================================
  // SCENARIO B: SYSTEM POPUPS (Scroll-triggered)
  // ============================================================

  const SystemPopups = {
    triggers: [],
    queue: [],
    currentPopup: null,
    isShowingPopup: false,
    observer: null,

    /**
     * Initialize system popups by scanning for trigger elements
     * Triggers should have data attributes:
     *   data-system-popup="true"
     *   data-popup-image="/path/to/image.png" OR
     *   data-popup-html="<div>HTML content</div>"
     */
    init() {
      this.triggers = Array.from(document.querySelectorAll('[data-system-popup]'));
      
      if (this.triggers.length === 0) return;

      // Create Intersection Observer to detect when triggers scroll into view
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          root: null,
          rootMargin: '-20% 0px -20% 0px', // Trigger when element is in middle 60% of viewport
          threshold: 0
        }
      );

      // Observe all triggers
      this.triggers.forEach(trigger => {
        this.observer.observe(trigger);
      });

      // Bind close event
      this.bindEvents();
    },

    /**
     * Handle intersection observer entries
     */
    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trigger = entry.target;
          
          // Only trigger once
          if (trigger.dataset.popupTriggered) return;
          trigger.dataset.popupTriggered = 'true';
          
          // Add to queue
          this.queue.push({
            image: trigger.dataset.popupImage,
            html: trigger.dataset.popupHtml,
            glitch: trigger.dataset.popupGlitch === 'true'
          });

          // Show next popup if not currently showing one
          if (!this.isShowingPopup) {
            this.showNextPopup();
          }

          // Stop observing this trigger
          this.observer.unobserve(trigger);
        }
      });
    },

    /**
     * Show the next popup in the queue
     */
    showNextPopup() {
      if (this.queue.length === 0) {
        this.isShowingPopup = false;
        return;
      }

      this.isShowingPopup = true;
      const popupData = this.queue.shift();

      // Create popup element
      this.currentPopup = document.createElement('div');
      this.currentPopup.className = 'popup popup-system';
      if (popupData.glitch) {
        this.currentPopup.classList.add('glitch-enter');
      }
      this.currentPopup.setAttribute('role', 'alertdialog');
      this.currentPopup.setAttribute('aria-modal', 'true');

      let content = '';
      if (popupData.image) {
        content = `<img src="${popupData.image}" alt="System notification" />`;
      } else if (popupData.html) {
        content = `
          <div class="popup-system-content">
            ${popupData.html}
          </div>
        `;
      }

      this.currentPopup.innerHTML = `
        ${content}
        <div class="popup-system-dismiss">Click anywhere to dismiss</div>
      `;

      document.body.appendChild(this.currentPopup);
      showBackdrop();

      // Animate in
      this.currentPopup.offsetHeight;
      this.currentPopup.classList.add('is-visible');
    },

    /**
     * Close the current popup and show next in queue
     */
    closeCurrentPopup() {
      if (!this.currentPopup) return;

      this.currentPopup.classList.remove('is-visible');
      hideBackdrop();

      setTimeout(() => {
        if (this.currentPopup) {
          this.currentPopup.remove();
          this.currentPopup = null;
        }
        
        // Show next popup in queue after a short delay
        setTimeout(() => {
          this.showNextPopup();
        }, 200);
      }, 300);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
      document.addEventListener('click', (e) => {
        if (this.isShowingPopup && this.currentPopup) {
          this.closeCurrentPopup();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (this.isShowingPopup && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.closeCurrentPopup();
        }
      });
    },

    /**
     * Reset all triggers (for re-reading)
     */
    reset() {
      this.triggers.forEach(trigger => {
        delete trigger.dataset.popupTriggered;
        this.observer.observe(trigger);
      });
      this.queue = [];
    }
  };

  // ============================================================
  // SCENARIO C: DOCUMENT VIEWER
  // ============================================================

  const DocumentViewer = {
    container: null,
    isOpen: false,

    /**
     * Initialize document viewer by binding to attachment links
     * Attachment links should have:
     *   class="attachment-link" or data-document-viewer="true"
     *   data-type="pdf|image|article"
     *   data-src="/path/to/file" OR data-content="<html>..."
     *   data-title="Document Title"
     */
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-document-viewer], .attachment-link');
        if (link) {
          e.preventDefault();
          this.open({
            type: link.dataset.type || 'image',
            src: link.dataset.src || link.href,
            content: link.dataset.content,
            title: link.dataset.title || link.textContent.trim()
          });
        }
      });

      // Keyboard support
      document.addEventListener('keydown', (e) => {
        if (this.isOpen && e.key === 'Escape') {
          this.close();
        }
      });
    },

    /**
     * Open the document viewer
     * @param {Object} options - Document options
     *   type: 'pdf', 'image', or 'article'
     *   src: URL to the document (for pdf/image)
     *   content: HTML content (for article)
     *   title: Display title
     */
    open(options) {
      this.createContainer(options);
      showBackdrop();
      
      // Click on backdrop closes viewer
      getOrCreateBackdrop().addEventListener('click', () => this.close(), { once: true });
      
      this.container.offsetHeight;
      this.container.classList.add('is-visible');
      this.isOpen = true;
    },

    /**
     * Create the document viewer container
     */
    createContainer(options) {
      // Remove existing
      const existing = document.getElementById('document-viewer');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.id = 'document-viewer';
      this.container.className = 'popup document-viewer';
      this.container.setAttribute('role', 'dialog');
      this.container.setAttribute('aria-modal', 'true');

      let bodyContent = '';
      let icon = '';

      switch (options.type) {
        case 'pdf':
          // For actual PDFs, embed in iframe
          icon = '📄';
          bodyContent = `<iframe src="${options.src}" title="${options.title}"></iframe>`;
          break;
        
        case 'image':
          // For images (including fake PDFs that are actually images)
          icon = '🖼️';
          bodyContent = `<img src="${options.src}" alt="${options.title}" />`;
          break;
        
        case 'article':
          // For HTML article content
          icon = '📰';
          bodyContent = `<div class="document-viewer-article">${options.content}</div>`;
          break;
        
        default:
          // Fallback to image
          bodyContent = `<img src="${options.src}" alt="${options.title}" />`;
      }

      this.container.innerHTML = `
        <div class="document-viewer-header">
          <span class="document-viewer-title">
            <span>${icon}</span>
            ${options.title}
          </span>
          <button class="document-viewer-close" aria-label="Close">
            ${createCloseIcon()}
          </button>
        </div>
        <div class="document-viewer-body">
          ${bodyContent}
        </div>
      `;

      // Bind close button
      this.container.querySelector('.document-viewer-close').addEventListener('click', () => {
        this.close();
      });

      // Prevent clicks inside from closing
      this.container.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      document.body.appendChild(this.container);
    },

    /**
     * Close the document viewer
     */
    close() {
      if (!this.container) return;

      this.container.classList.remove('is-visible');
      hideBackdrop();
      this.isOpen = false;

      setTimeout(() => {
        if (this.container) {
          this.container.remove();
          this.container = null;
        }
      }, 300);
    }
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function initPopupSystem() {
    // Initialize document viewer (always available)
    DocumentViewer.init();

    // Initialize system popups if triggers exist on page
    SystemPopups.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopupSystem);
  } else {
    initPopupSystem();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  window.PopupSystem = {
    // Sequence popups (for Chapter 1)
    sequence: {
      start: (items, onComplete) => SequencePopups.init(items, onComplete)
    },
    
    // System popups (scroll-triggered)
    system: {
      reset: () => SystemPopups.reset()
    },
    
    // Document viewer
    document: {
      open: (options) => DocumentViewer.open(options),
      close: () => DocumentViewer.close()
    },

    // Utility
    showBackdrop,
    hideBackdrop
  };

})();
