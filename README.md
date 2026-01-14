# Stream Deck Icon Generator

A powerful web-based tool for creating custom Stream Deck icons with gradient backgrounds. Generate professional-looking icons by combining FontAwesome SVG graphics with customizable gradient overlays, all exportable as PNG files in multiple sizes.

## Features

### Icon Management
- ✓ **549+ FontAwesome Icons** - Browse and search through a comprehensive icon library
- ✓ **Lazy Loading** - Optimized icon picker with IntersectionObserver for fast performance
- ✓ **Real-time Search** - Debounced search with instant filtering
- ✓ **SVG Caching** - Intelligent caching system for 90% faster loading

### Gradient Customization
- ✓ **Linear & Radial Gradients** - Switch between gradient types
- ✓ **Multi-stop Gradients** - Add, remove, and position unlimited color stops
- ✓ **Interactive Gradient Bar** - Drag color stops directly on the preview bar
- ✓ **Gradient Randomizer** - Generate random gradients with optional base color
- ✓ **Preset Styles** - Choose from Smooth, Glossy, Vibrant, and Subtle gradient styles
- ✓ **Color-Aware Generation** - Create grayscale or same-hue gradients based on base color

### Export & Workflow
- ✓ **Multiple Sizes** - Export at 72x72, 144x144, or 256x256 pixels
- ✓ **Batch Export** - Export all three sizes simultaneously
- ✓ **Copy to Clipboard** - Quick copy for immediate use
- ✓ **File System Access API** - Choose custom save locations
- ✓ **Adjustable Corner Radius** - Customize border rounding (0-28px)

### User Experience
- ✓ **Preset Management** - Save, load, and delete gradient presets
- ✓ **State Persistence** - LocalStorage saves your settings between sessions
- ✓ **Keyboard Shortcuts** - Full keyboard navigation support
- ✓ **Real-time Preview** - Instant canvas updates with zoom controls (1x, 4x, 8x)
- ✓ **Fully Accessible** - WCAG-compliant with ARIA labels and semantic HTML
- ✓ **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ✓ **Dark Theme** - Modern dark morphism gradient background

## Demo

Visit the live demo: [Stream Deck Icon Generator](https://syntaxsidekick.github.io/Stream-Deck-Icon-Generator/) *(update with your actual URL)*

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/SyntaxSidekick/Stream-Deck-Icon-Generator.git
cd Stream-Deck-Icon-Generator
```

2. Serve the application using any static file server:

**Using npx (recommended):**
```bash
npx serve .
```

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js http-server:**
```bash
npm install -g http-server
http-server
```

3. Open your browser and navigate to:
```
http://localhost:3000
```
*(Port may vary depending on your server)*

## Usage

### Basic Workflow

1. **Select an Icon**
   - Click "Choose Icon" to open the icon picker
   - Search for icons by name (e.g., "github", "twitter", "gaming")
   - Click an icon to select it

2. **Customize the Gradient**
   - Choose between Linear or Radial gradient types
   - Drag color stops on the gradient bar to reposition them
   - Click stops to change their colors
   - Add or remove stops using the buttons
   - Apply preset gradient styles (Smooth, Glossy, Vibrant, Subtle)

3. **Adjust Icon Settings**
   - Set icon color using the color picker
   - Adjust icon size (20-80%)
   - Fine-tune vertical offset (-30% to +30%)

4. **Export Your Icon**
   - Choose export size (72, 144, or 256 pixels)
   - Set corner radius (0-28px)
   - Enter a custom filename
   - Click "Export PNG" or "Export All Sizes"
   - Alternatively, use "Copy" to copy directly to clipboard

### Gradient Randomizer

1. **Basic Randomization:**
   - Click "Randomize Gradient" to generate a random gradient

2. **Color-Based Randomization:**
   - Select a base color in the "Random base color" picker
   - Click "Randomize Gradient" to generate variations based on that color
   - For grayscale base colors (low saturation), generates grayscale gradients
   - For colorful base colors, generates same-hue gradients with varying lightness

3. **Clear Base Color:**
   - Click the "×" button to return to fully random gradients

### Preset Management

1. **Save a Preset:**
   - Configure your desired gradient
   - Click the save button (💾) next to the preset dropdown
   - Enter a name for your preset

2. **Load a Preset:**
   - Select a preset from the dropdown menu
   - The gradient will automatically apply

3. **Delete a Preset:**
   - Select the preset you want to delete
   - Click the delete button (🗑️)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + I` | Open icon picker |
| `Ctrl + E` | Export current icon |
| `Ctrl + R` | Randomize gradient |
| `↑` / `↓` | Adjust active value by ±1 |
| `Shift + ↑` / `↓` | Adjust active value by ±10 |
| `+` / `-` | Increase/decrease active value |
| `Esc` | Close icon picker |

## Technology Stack

### Frontend
- **Vanilla JavaScript (ES6 Modules)** - No framework dependencies
- **HTML5 Canvas API** - Real-time icon rendering
- **CSS3** - Modern styling with gradients and animations

### Browser APIs
- **IntersectionObserver API** - Efficient lazy loading of icons
- **File System Access API** - Custom save file locations
- **LocalStorage API** - State and preset persistence
- **Clipboard API** - Copy to clipboard functionality

### Development Tools
- **Git** - Version control
- **npx serve** - Local development server

## Project Structure

```
streamdeck-icon-generator/
├── index.html              # Main HTML file
├── README.md               # This file
├── .gitignore             # Git ignore patterns
│
├── public/
│   ├── icons/
│   │   └── fontawesome/   # FontAwesome SVG icons
│   │       ├── index.json # Icon index for lazy loading
│   │       └── *.svg      # 549 SVG icon files
│   └── presets/           # User-saved gradient presets
│
├── src/
│   ├── js/
│   │   ├── app.js         # Main entry point
│   │   ├── state.js       # Application state management
│   │   ├── ui.js          # UI controls and canvas rendering
│   │   ├── icons.js       # Icon picker with lazy loading
│   │   ├── gradient.js    # Gradient controls and randomization
│   │   ├── export.js      # PNG export functionality
│   │   ├── storage.js     # LocalStorage persistence
│   │   ├── presets.js     # Preset management
│   │   └── keyboard.js    # Keyboard shortcuts
│   │
│   └── styles/
│       ├── base.css       # Core styles and layout
│       └── modal.css      # Icon picker modal styles
│
└── assets/
    └── ui/                # Additional UI assets (if any)
```

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 86+ | Full support including File System Access API |
| Edge | 86+ | Full support including File System Access API |
| Firefox | 78+ | File System Access API falls back to download |
| Safari | 14+ | File System Access API falls back to download |
| Mobile Safari | 14+ | Limited File System Access API support |
| Chrome Android | 86+ | Limited File System Access API support |

**Note:** File System Access API is not fully supported in Firefox and Safari. The app gracefully falls back to standard download behavior.

## Performance Optimizations

- **SVG Caching**: Loaded SVG icons are cached in a Map for instant re-use
- **Lazy Loading**: Icons are only loaded when scrolled into view (100px margin)
- **Debounced Search**: Search filtering is debounced to 200ms
- **Auto-Save**: Settings are auto-saved with 500ms debounce
- **Optimized Rendering**: Canvas updates only when necessary

## Accessibility Features

- **Semantic HTML**: Proper use of `<header>`, `<main>`, `<section>`, `<fieldset>`, and `<legend>`
- **ARIA Labels**: Comprehensive ARIA labels and roles for screen readers
- **Keyboard Navigation**: Full keyboard support with focus management
- **Skip Navigation**: Skip-to-content link for screen reader users
- **Touch-Friendly**: Minimum 44px touch targets on mobile
- **Focus Indicators**: Clear focus states for all interactive elements
- **Live Regions**: ARIA live regions for dynamic content updates
- **Color Contrast**: WCAG-compliant color contrast ratios

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use vanilla JavaScript (no dependencies)
- Follow ES6 module patterns
- Maintain accessibility standards
- Test on multiple browsers and devices
- Update documentation for new features

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **FontAwesome** - Icon library provider
- **Stream Deck** - Inspiration for icon dimensions and use case

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/SyntaxSidekick/Stream-Deck-Icon-Generator/issues) page
2. Open a new issue with detailed information
3. Include browser version, OS, and steps to reproduce

## Roadmap

Future enhancements under consideration:

- Custom SVG upload support
- Text overlay options
- Pattern/texture backgrounds
- Gradient animation presets
- Icon effect filters (shadow, glow, blur)
- Template library
- Bulk icon generation
- Plugin system for custom generators

---

**Made with ❤️ for the Stream Deck community**
