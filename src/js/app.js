import { state } from "./state.js";
import { initIconPicker } from "./icons.js";
import { initGradientControls } from "./gradient.js";
import { initUiBindings, renderAll, setSelectedIcon } from "./ui.js";
import { initExport } from "./export.js";
import { initPresets } from "./presets.js";
import { initKeyboardShortcuts } from "./keyboard.js";
import { loadState, saveState } from "./storage.js";

// Load saved state
const savedState = loadState();
if (savedState) {
  Object.assign(state.background, savedState.background);
  Object.assign(state.iconStyle, savedState.iconStyle);
  Object.assign(state.export, savedState.export);
  Object.assign(state.ui, savedState.ui);
  // Ensure colorMode defaults to 'rgb' if not in saved state
  if (!state.ui.colorMode) {
    state.ui.colorMode = "rgb";
  }
  if (savedState.icon.name) {
    state.icon.name = savedState.icon.name;
    state.icon.exportName = savedState.icon.exportName;
  }
}

// bootstrap
initUiBindings();
initIconPicker();
initGradientControls();
initExport();
initPresets();
initKeyboardShortcuts();

// Load icons into the main grid
(async () => {
  const iconPickerGrid = document.getElementById("iconPickerGrid");
  if (iconPickerGrid) {
    try {
      const response = await fetch("./public/icons/fontawesome/index.json");
      const iconNames = await response.json();
      
      // Popular coding framework icons
      const frameworkIcons = [
        "react", "angular", "vue", "python", "node-js", "js",
        "java", "docker", "git-alt", "github", "npm"
      ];
      
      // Filter to only icons that exist in the index
      const iconsToShow = frameworkIcons.filter(name => iconNames.includes(name));
      
      // If we don't have enough framework icons, add more from the list
      if (iconsToShow.length < 11) {
        const remaining = iconNames.filter(n => !iconsToShow.includes(n)).slice(0, 11 - iconsToShow.length);
        iconsToShow.push(...remaining);
      }
      
      for (const name of iconsToShow) {
        const btn = document.createElement("button");
        btn.className = "appicon";
        btn.type = "button";
        btn.dataset.name = name;
        btn.setAttribute("aria-label", `Select ${name} icon`);
        
        try {
          const svgResp = await fetch(`./public/icons/fontawesome/${name}.svg`);
          const svgText = await svgResp.text();
          btn.innerHTML = svgText;
        } catch (e) {
          btn.innerHTML = `<div class="glyph">${name.slice(0, 2).toUpperCase()}</div>`;
        }
        
        btn.addEventListener("click", async () => {
          document.querySelectorAll(".appicon").forEach(x => x.classList.remove("selected"));
          btn.classList.add("selected");
          
          try {
            const svgResp = await fetch(`./public/icons/fontawesome/${name}.svg`);
            const svgText = await svgResp.text();
            
            // Update state first
            state.icon.name = name;
            state.icon.svgText = svgText;
            state.icon.exportName = name;
            
            // Then update UI
            setSelectedIcon(svgText);
            
            const iconNameInput = document.getElementById("iconNameInput");
            if (iconNameInput) iconNameInput.value = name;
          } catch (error) {
            console.error("Failed to load icon:", error);
          }
        });
        
        iconPickerGrid.appendChild(btn);
      }
      
      // Add the "open modal" button last
      const openBtn = document.createElement("button");
      openBtn.className = "appicon";
      openBtn.type = "button";
      openBtn.id = "openIconPickerBtn";
      openBtn.innerHTML = `<div class="glyph">+</div>`;
      openBtn.setAttribute("aria-label", "Open full icon picker");
      openBtn.addEventListener("click", () => {
        document.getElementById("openIconPicker").click();
      });
      iconPickerGrid.appendChild(openBtn);
      
    } catch (error) {
      console.error("Failed to load icons:", error);
    }
  }
})();

// Auto-save state on changes (debounced)
let saveTimeout;
const originalRenderAll = renderAll;
window.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveState(state), 500);
});

// if icon is already set (from localStorage), reload it
if (state.icon.name) {
  // Icon will be loaded from cache when picker opens
  const iconNameInput = document.getElementById("iconNameInput");
  const selectedIconName = document.getElementById("selectedIconName");
  const selectedIconHint = document.getElementById("selectedIconHint");
  
  if (iconNameInput) iconNameInput.value = state.icon.exportName || state.icon.name;
  if (selectedIconName) selectedIconName.textContent = state.icon.name;
  if (selectedIconHint) selectedIconHint.textContent = "Cached";
}

renderAll(true);

