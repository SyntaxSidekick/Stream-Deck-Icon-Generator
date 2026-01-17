# Stream Deck Icon Generator

> ⚠️ **DEVELOPMENT STATUS**: This project is currently under active development. Features are being implemented and bugs are being fixed. Please report any issues you encounter on the [Issues page](https://github.com/SyntaxSidekick/Stream-Deck-Icon-Generator/issues).

A powerful web-based tool for creating custom Stream Deck icons with gradient backgrounds. Generate professional-looking icons by combining FontAwesome SVG graphics with customizable gradient overlays, all exportable as PNG files in multiple sizes.

## Features

### Icon Management
- ✓ **549+ FontAwesome Icons** - Browse and search through a comprehensive icon library
- ✓ **Lazy Loading** - Optimized icon picker with IntersectionObserver for fast performance
- ✓ **Real-time Search** - Debounced search with instant filtering
- ✓ **SVG Caching** - Intelligent caching system for 90% faster loading

### Gradient Customization
- ✓ **Linear & Radial Gradients** - Switch between gradient types with visual toggle
- ✓ **Multi-stop Gradients** - Add, remove, and position unlimited color stops
- ✓ **Interactive Gradient Bar** - Drag color stops directly on the preview bar
- ✓ **Color Mode Toggle** - Switch between RGB and HSL color modes
- ✓ **Visual Slider Controls** - Draggable knobs for angle and position adjustments
- ✓ **Stop Indicators** - Visual color swatches showing all gradient stops
- ✓ **Gradient Randomizer** - Generate random gradients instantly
- ✓ **Base Color Selection** - Choose a base color for gradient generation
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
   - Click on one of the preset framework icons (React, Angular, Vue, Python, etc.)
   - Or click the "+" button to open the full icon picker
   - Search for icons by name (e.g., "github", "twitter", "gaming")
   - Click an icon to select it

2. **Customize the Gradient**
   - **Choose Base Color**: Select a base color using the color picker
   - **Apply Preset Style**: Click Smooth, Glossy, Vibrant, or Subtle to generate a gradient based on your base color
   - **Switch Gradient Type**: Toggle between Linear and Radial gradients
   - **Adjust Angle**: For linear gradients, drag the angle slider (0-360°)
   - **Modify Color Stops**:
     - Click on a stop indicator to make it active
     - Use the color picker to change the active stop's color
     - Drag the position slider to reposition the stop (0-100%)
     - Click "+" to add a new stop
     - Click "−" to remove the active stop (minimum 2 stops required)
   - **Toggle Color Mode**: Switch between RGB and HSL modes
   - **Randomize**: Click "Randomize" for instant random gradients

3. **Adjust Icon Settings**
   - Set icon color using the color picker (default: white)
   - Adjust icon size using the slider (20-80%)
   - Fine-tune vertical offset with the slider (-30% to +30%)

4. **Export Your Icon**
   - Choose export size (72, 144, or 256 pixels)
   - Set corner radius (0-28px)
   - Enter a custom filename
   - Click "Export PNG" or "Export All Sizes"
   - Alternatively, use "Copy" to copy directly to clipboard

### Gradient Randomizer

1. **Basic Randomization:**
   - Click "Randomize" button to generate a completely random gradient
   - Random type (linear or radial), angle, number of stops, and colors

2. **Base Color Gradients:**
   - Select a base color using the "Base Color" picker
   - Click a preset style button (Smooth, Glossy, Vibrant, or Subtle)
   - For grayscale colors (black, white, gray), generates smooth grayscale gradients
   - For vibrant colors, generates same-hue gradients with varying lightness and saturation
   - **Smooth**: 2-stop simple gradients
   - **Glossy**: 3-4 stops with highlights for a glossy effect
   - **Vibrant**: High saturation color bursts
   - **Subtle**: Low saturation, gentle transitions

3. **Manual Control:**
   - Click any gradient stop indicator to select it
   - Use the visible color picker to change the stop color to any value
   - Drag the position slider or the stop itself on the gradient bar
   - Add or remove stops as needed for complete control

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

### Adding Custom SVG Icons

The application currently includes 549+ FontAwesome icons, but you can easily add your own custom SVG files:

1. **Add SVG Files:**
   - Place your SVG files in `public/icons/fontawesome/` directory
   - Use lowercase names with hyphens (e.g., `my-custom-icon.svg`)
   - Ensure SVGs have a `viewBox` attribute for proper scaling

2. **Update the Icon Index:**
   
   **Option A: PowerShell (Windows)**
   ```powershell
   Get-ChildItem public/icons/fontawesome/*.svg |
     Select-Object -ExpandProperty BaseName |
     Sort-Object |
     ConvertTo-Json |
     Set-Content public/icons/fontawesome/index.json
   ```

   **Option B: Bash (macOS/Linux)**
   ```bash
   ls public/icons/fontawesome/*.svg | 
     sed 's|.*/||;s|\.svg$||' | 
     sort | 
     jq -R -s -c 'split("\n")[:-1]' > public/icons/fontawesome/index.json
   ```

   **Option C: Node.js (Cross-platform)**
   ```javascript
   const fs = require('fs');
   const path = require('path');
   
   const iconDir = './public/icons/fontawesome';
   const icons = fs.readdirSync(iconDir)
     .filter(f => f.endsWith('.svg'))
     .map(f => path.basename(f, '.svg'))
     .sort();
   
   fs.writeFileSync(
     path.join(iconDir, 'index.json'),
     JSON.stringify(icons, null, 2)
   );
   ```

3. **Rebuild (if using build process):**
   ```bash
   npm run build
   ```

4. **Refresh the Application:**
   - Reload the page
   - Your custom icons will appear in the icon picker
   - They are searchable by filename

**SVG Tips:**
- Keep file sizes small (< 10KB recommended)
- Use single-color SVGs for best results with the color picker
- Remove unnecessary metadata and comments
- Ensure proper `viewBox` for consistent scaling
- Use kebab-case naming (lowercase with hyphens)

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

## Support & Bug Reports

If you encounter any issues or have questions:

1. **Check Existing Issues**: Browse the [Issues page](https://github.com/SyntaxSidekick/Stream-Deck-Icon-Generator/issues) to see if your problem has been reported
2. **Report a Bug**: Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots if applicable
3. **Feature Requests**: Suggest new features or improvements via GitHub Issues
4. **Questions**: Ask questions in the Discussions section

**Current Known Issues:**
- Some gradient presets may not save correctly
- File System Access API limited in Firefox/Safari (falls back to download)
- Mobile touch interactions need refinement

Your feedback helps improve this tool for everyone!

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
