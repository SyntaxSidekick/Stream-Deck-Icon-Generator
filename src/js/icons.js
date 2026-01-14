import { state } from "./state.js";
import { renderAll, setSelectedIcon } from "./ui.js";

const ICON_BASE = "/public/icons/fontawesome";

// SVG cache to prevent re-fetching
const svgCache = new Map();

export async function initIconPicker() {
  const openBtn   = document.getElementById("openIconPicker");
  const closeBtn  = document.getElementById("closeIconPicker");
  const overlay   = document.getElementById("iconModalOverlay");
  const modal     = document.getElementById("iconModal");
  const grid      = document.getElementById("iconGrid");
  const search    = document.getElementById("iconSearch");
  const loadingIndicator = document.getElementById("iconLoadingIndicator");

  let iconNames = [];
  let loaded = false;
  let scrollPosition = 0;
  
  // Detect if mobile device
  const isMobile = () => window.innerWidth <= 768;

  function closeModal() {
    modal.dataset.open = "false";
    modal.setAttribute("aria-hidden", "true");
    
    // Only remove body scroll lock on desktop
    if (!isMobile()) {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      window.scrollTo(0, scrollPosition);
    }
    
    openBtn.focus();
  }

  openBtn.addEventListener("click", async () => {
    modal.dataset.open = "true";
    modal.setAttribute("aria-hidden", "false");
    
    // Only apply body scroll lock on desktop
    if (!isMobile()) {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";
    }

    if (!loaded) {
      showLoading(loadingIndicator);
      try {
        iconNames = await loadIndex();
        await renderIcons(iconNames, grid, loadingIndicator);
        loaded = true;
      } catch (error) {
        console.error("Failed to load icons:", error);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:rgba(255,255,255,.6);">
          Failed to load icons. Please refresh the page.
        </div>`;
      } finally {
        hideLoading(loadingIndicator);
      }
    }

    search.value = "";
    search.focus();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.dataset.open === "true") {
      closeModal();
    }
  });

  let searchTimeout;
  search.addEventListener("input", async () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const q = search.value.toLowerCase().trim();
      const filtered = q
        ? iconNames.filter(n => n.includes(q))
        : iconNames;

      grid.innerHTML = "";
      showLoading(loadingIndicator);
      await renderIcons(filtered, grid, loadingIndicator);
      hideLoading(loadingIndicator);
    }, 200); // debounce search
  });
}

/* ---------- Loaders ---------- */

async function loadIndex() {
  const res = await fetch(`${ICON_BASE}/index.json`);
  if (!res.ok) {
    throw new Error("Failed to load index.json");
  }
  return await res.json();
}

async function loadSvg(name) {
  // Check cache first
  if (svgCache.has(name)) {
    return svgCache.get(name);
  }

  const res = await fetch(`${ICON_BASE}/${name}.svg`);
  if (!res.ok) {
    throw new Error(`Missing SVG: ${name}`);
  }
  const svg = await res.text();
  
  // Store in cache
  svgCache.set(name, svg);
  return svg;
}

/* ---------- Render ---------- */

async function renderIcons(names, grid, loadingIndicator) {
  const frag = document.createDocumentFragment();

  // Create placeholder tiles first for immediate feedback
  for (const name of names) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "iconTile iconTile--loading";
    tile.dataset.icon = name;
    tile.setAttribute("aria-label", `Select ${name} icon`);
    tile.setAttribute("role", "gridcell");
    tile.innerHTML = `
      <div class="iconPlaceholder" aria-hidden="true"></div>
      <div class="iconName">${name}</div>
    `;
    frag.appendChild(tile);
  }
  grid.appendChild(frag);

  // Load SVGs in batches using IntersectionObserver for lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const tile = entry.target;
        const name = tile.dataset.icon;
        
        if (tile.classList.contains("iconTile--loading")) {
          try {
            const svg = await loadSvg(name);
            const placeholder = tile.querySelector(".iconPlaceholder");
            if (placeholder) {
              placeholder.outerHTML = svg;
            }
            tile.classList.remove("iconTile--loading");

            // Add click handler
            tile.addEventListener("click", async () => {
              // Update ARIA selected state for all tiles
              grid.querySelectorAll('.iconTile').forEach(t => {
                t.dataset.selected = "false";
                t.setAttribute("aria-selected", "false");
              });
              tile.dataset.selected = "true";
              tile.setAttribute("aria-selected", "true");
              
              state.icon.name = name;
              state.icon.svgText = svg;
              state.icon.exportName = name; // Reset export name when selecting new icon
              await setSelectedIcon(svg);
              closeModal();
              renderAll(true);
            });
          } catch {
            // Skip missing files
            tile.style.opacity = "0.3";
          }
        }
        
        observer.unobserve(tile);
      }
    });
  }, {
    root: grid.parentElement,
    rootMargin: "100px" // Start loading slightly before visible
  });

  // Observe all tiles
  grid.querySelectorAll(".iconTile").forEach(tile => observer.observe(tile));

  markSelected(grid);
  
  function closeModal() {
    const modal = document.getElementById("iconModal");
    if (modal) {
      modal.dataset.open = "false";
      modal.setAttribute("aria-hidden", "true");
    }
  }
}

function markSelected(grid) {
  grid.querySelectorAll(".iconTile").forEach(tile => {
    tile.dataset.selected =
      tile.dataset.icon === state.icon.name ? "true" : "false";
  });
}

function showLoading(indicator) {
  if (indicator) indicator.style.display = "block";
}

function hideLoading(indicator) {
  if (indicator) indicator.style.display = "none";
}
