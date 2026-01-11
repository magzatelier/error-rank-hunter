# Interactive Story Website

An immersive web-based reading experience featuring multiple visual themes, interactive system popups, and an authentic forum interface.

## 📁 Project Structure

```
your-story/
├── index.html                  # Landing page / Table of Contents
├── css/
│   ├── base.css               # Core styles, CSS variables, dark/light themes
│   ├── components.css         # UI components (nav, popups, buttons)
│   └── themes/
│       ├── prose.css          # Traditional novel reading style
│       └── forum.css          # Hunter Network nested-comment style
├── js/
│   ├── settings.js            # Dark/light mode, font size persistence
│   └── popup-system.js        # All popup/overlay functionality
├── chapters/
│   ├── chapter-001.html       # System popup sequence (no prose)
│   ├── chapter-002-forum.html # Hunter Network forum chapter
│   └── chapter-003.html       # Standard prose chapter
├── assets/
│   ├── images/
│   │   ├── system-popups/     # LitRPG system notification images (if using images)
│   │   └── attachments/       # Forum attachment images
│   └── documents/             # Any actual PDFs
└── README.md                  # This file
```

## 🚀 Getting Started

### 1. Set Up GitHub Repository

1. Create a new repository on GitHub
2. Upload all these files maintaining the folder structure
3. Go to repository **Settings** → **Pages**
4. Under "Source", select **main** branch
5. Click **Save**
6. Your site will be live at: `https://yourusername.github.io/repository-name/`

### 2. Configure Disqus Comments

1. Go to [Disqus](https://disqus.com/) and create an account
2. Click "Get Started" → "I want to install Disqus on my site"
3. Enter your site name (this becomes your "shortname")
4. In ALL chapter HTML files, find this line:
   ```javascript
   s.src = 'https://your-disqus-shortname.disqus.com/embed.js';
   ```
5. Replace `your-disqus-shortname` with your actual Disqus shortname

## 📖 Chapter Types

### Type 1: System Popup Sequence (Chapter 1)
- Entire chapter is experienced as popups
- No prose content - just the system management sequence
- Click/tap to advance through each popup
- Perfect for cold opens, dramatic reveals, or system-focused scenes

### Type 2: Forum Chapter (Chapter 2)
- Hunter Network forum with nested comment threads
- Uses `↪` arrows for reply nesting
- Embedded articles that open in a document viewer
- PDF attachments that display inline
- Authentic internet community aesthetic

### Type 3: Prose Chapter (Chapter 3)
- Traditional novel reading format
- Clean, readable typography
- Can include scroll-triggered system popups (Scenario B)
- Internal thoughts styled with `<span class="thought">`

## 🎨 Customization

### Changing the Color Scheme

Edit `css/base.css` and find the `:root` section:

```css
:root {
  /* Main accent color */
  --color-accent: #5c6bc0;
  --color-accent-hover: #3f51b5;
  
  /* System popup colors */
  --color-system-border: #4a9eff;
  --color-system-glow: rgba(74, 158, 255, 0.4);
}
```

### Adding Scroll-Triggered System Popups (Prose Chapters)

Add an invisible trigger in your prose where you want the popup:

```html
<span 
  class="popup-trigger" 
  data-system-popup="true" 
  data-popup-image="../assets/images/system-popups/your-popup.png"
  data-popup-glitch="true"
></span>
```

The popup appears when the reader scrolls to that point.

### Creating Forum Chapters

Use the nested comment structure:

```html
<div class="thread-comments">
  <div class="comment">Top-level comment</div>
  <div class="comment-reply">First reply</div>
  <div class="comment-reply">Deeper reply</div>
  <div class="comment-reply comment-deleted">(This comment has been deleted)</div>
  <div class="comment">Another top-level comment</div>
</div>
```

### Adding Article Embeds (Forum)

```html
<div class="article-embed" data-document-viewer="true" data-type="article" data-title="Article Title">
  <div class="article-embed-header">
    <span class="article-embed-source">Hunter Daily</span>
  </div>
  <div class="article-embed-title">Full Article Headline Here</div>
</div>
```

Then add the article content in the JavaScript section at the bottom of the chapter.

## 📝 Adding New Chapters

### Prose Chapter
1. Copy `chapter-003.html` as template
2. Update chapter number, title, navigation links
3. Replace prose content
4. Update Disqus `page.identifier`

### Forum Chapter
1. Copy `chapter-002-forum.html` as template
2. Update thread titles and comments
3. Add any embedded articles to the JavaScript `articleContent` object
4. Update navigation and Disqus identifier

### System Popup Chapter
1. Copy `chapter-001.html` as template
2. Edit the `openingSequence` array
3. Each popup is an object with `type: 'html'` and HTML content
4. Use the helper functions (`systemPopup`, `errorPopup`, `glitchPopup`)

## 📱 Mobile & Accessibility

- Fully responsive on all screen sizes
- Respects `prefers-reduced-motion` for animations
- Keyboard navigation for popups (Escape, Enter, Space)
- Focus indicators for accessibility
- Dark/light mode respects system preference

## 🔧 Troubleshooting

### Popups not appearing?
- Check that `popup-system.js` is loaded
- Verify image paths are correct
- Check browser console (F12) for errors

### Dark mode not persisting?
- Ensure `settings.js` is in the `<head>` before body loads
- Check if localStorage is available (not in private mode)

### Forum articles not opening?
- Make sure the `articleContent` object has an entry matching the `data-title`
- Check the JavaScript console for errors

### Disqus not showing?
- Comments don't work on `file://` URLs - use a local server or deploy
- Verify your shortname is correct
- Check if ad blockers are interfering

## 🎯 File Naming Convention

For 200+ chapters, use zero-padded numbers:
- `chapter-001.html`
- `chapter-042.html`
- `chapter-103-forum.html`

This ensures proper alphabetical sorting.

---

Good luck with your story! The worldbuilding looks fantastic. 🏹
