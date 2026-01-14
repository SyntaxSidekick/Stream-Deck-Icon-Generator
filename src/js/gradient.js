import { state } from "./state.js";
import { renderAll } from "./ui.js";

export function initGradientControls() {
  const gradBar = document.getElementById("gradBar");

  const typeGroup = document.getElementById("gradientType");
  const angleField = document.getElementById("angleField");
  const angle = document.getElementById("angle");

  const addStop = document.getElementById("addStop");
  const removeStop = document.getElementById("removeStop");

  const stopColor = document.getElementById("stopColor");
  const stopColorHex = document.getElementById("stopColorHex");
  const stopPos = document.getElementById("stopPos");
  
  const randomizeBtn = document.getElementById("randomizeGradient");
  const randomBaseColor = document.getElementById("randomBaseColor");
  const randomBaseColorHex = document.getElementById("randomBaseColorHex");
  const clearBaseColorBtn = document.getElementById("clearBaseColor");
  const styleGroup = document.getElementById("gradientStyle");

  let selectedStyle = null; // null means custom/manual

  // build stop DOM
  rebuildStopsDom();
  
  // Listen for preset loads
  document.addEventListener("preset-loaded", () => {
    rebuildStopsDom();
    syncActiveStopControls();
  });
  
  // Base color sync
  if (randomBaseColor && randomBaseColorHex) {
    randomBaseColor.addEventListener("input", () => {
      randomBaseColorHex.value = randomBaseColor.value;
    });
    randomBaseColorHex.addEventListener("input", () => {
      const v = normalizeHex(randomBaseColorHex.value);
      if (v) {
        randomBaseColor.value = v;
        randomBaseColorHex.value = v;
      }
    });
  }
  
  // Clear base color
  if (clearBaseColorBtn) {
    clearBaseColorBtn.addEventListener("click", () => {
      randomBaseColor.value = "#667eea";
      randomBaseColorHex.value = "#667eea";
    });
  }
  
  // Randomize gradient
  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", () => {
      const baseColor = randomBaseColorHex.value;
      const useBaseColor = baseColor && normalizeHex(baseColor);
      
      randomizeGradient(useBaseColor, selectedStyle);
      rebuildStopsDom();
      syncActiveStopControls();
      
      // Update UI controls
      angle.value = String(state.background.angle);
      angleField.style.display = state.background.type === "linear" ? "" : "none";
      
      if (typeGroup) {
        typeGroup.querySelectorAll(".chip").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.type === state.background.type);
        });
      }
      
      renderAll(true);
    });
  }

  // type
  typeGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const type = btn.dataset.type;
    state.background.type = type;

    typeGroup.querySelectorAll(".chip").forEach(c => {
      const isActive = c === btn;
      c.classList.toggle("active", isActive);
      c.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    angleField.style.display = type === "linear" ? "" : "none";
    renderAll();
  });

  // gradient style
  if (styleGroup) {
    styleGroup.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const style = btn.dataset.style;
      
      // Toggle: if clicking the active one, deactivate it
      if (selectedStyle === style) {
        selectedStyle = null;
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
        return;
      }
      
      selectedStyle = style;

      styleGroup.querySelectorAll(".chip").forEach(c => {
        const isActive = c === btn;
        c.classList.toggle("active", isActive);
        c.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      const baseColor = randomBaseColorHex.value;
      const useBaseColor = baseColor && normalizeHex(baseColor);
      
      applyGradientStyle(style, useBaseColor);
      rebuildStopsDom();
      syncActiveStopControls();
      renderAll(true);
    });
  }

  // angle
  angle.addEventListener("input", () => {
    const val = Number(angle.value);
    state.background.angle = val;
    angle.setAttribute("aria-valuenow", String(val));
    const angleValueSpan = document.getElementById("angleValue");
    if (angleValueSpan) angleValueSpan.textContent = `${val}°`;
    renderAll();
  });

  // add stop
  addStop.addEventListener("click", () => {
    const id = crypto.randomUUID().slice(0, 6);
    const pos = 50;
    const color = "#ffffff";
    state.background.stops.push({ id, color, pos });
    state.ui.activeStopId = id;
    rebuildStopsDom();
    syncActiveStopControls();
    renderAll();
  });

  // remove stop
  removeStop.addEventListener("click", () => {
    if (state.background.stops.length <= 2) return;
    const id = state.ui.activeStopId;
    const idx = state.background.stops.findIndex(s => s.id === id);
    if (idx === -1) return;
    state.background.stops.splice(idx, 1);
    state.ui.activeStopId = state.background.stops[Math.max(0, idx - 1)].id;
    rebuildStopsDom();
    syncActiveStopControls();
    renderAll();
  });

  // active stop controls
  stopColor.addEventListener("input", () => {
    setActiveStopColor(stopColor.value);
  });
  stopColorHex.addEventListener("input", () => {
    const v = normalizeHex(stopColorHex.value);
    if (!v) return;
    setActiveStopColor(v);
  });
  stopPos.addEventListener("input", () => {
    const val = Number(stopPos.value);
    setActiveStopPos(val);
    stopPos.setAttribute("aria-valuenow", String(val));
    const stopPosValueSpan = document.getElementById("stopPosValue");
    if (stopPosValueSpan) stopPosValueSpan.textContent = `${val}%`;
  });

  function setActiveStopColor(color) {
    const s = getActiveStop();
    if (!s) return;
    s.color = color;
    stopColor.value = color;
    stopColorHex.value = color;
    renderAll();
    updateStopsDomOnly();
  }

  function setActiveStopPos(pos) {
    const s = getActiveStop();
    if (!s) return;
    s.pos = clamp(Math.round(pos), 0, 100);
    stopPos.value = String(s.pos);
    renderAll();
    updateStopsDomOnly();
  }

  // drag stops
  let dragging = false;
  let dragId = null;

  gradBar.addEventListener("pointerdown", (e) => {
    const stopEl = e.target.closest(".stop");
    if (!stopEl) return;
    dragging = true;
    dragId = stopEl.dataset.id;
    state.ui.activeStopId = dragId;
    syncActiveStopControls();
    stopEl.classList.add("dragging");
    stopEl.setPointerCapture(e.pointerId);
  });

  gradBar.addEventListener("pointermove", (e) => {
    if (!dragging || !dragId) return;
    const rect = gradBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = clamp((x / rect.width) * 100, 0, 100);
    const s = state.background.stops.find(st => st.id === dragId);
    if (!s) return;
    s.pos = Math.round(pct);
    syncActiveStopControls(); // keeps range synced while dragging
    updateStopsDomOnly();
    renderAll();
  });

  gradBar.addEventListener("pointerup", (e) => {
    const stopEl = gradBar.querySelector(`.stop[data-id="${dragId}"]`);
    if (stopEl) stopEl.classList.remove("dragging");
    dragging = false;
    dragId = null;
  });

  // initial sync
  angle.value = String(state.background.angle);
  angleField.style.display = state.background.type === "linear" ? "" : "none";
  syncActiveStopControls();
  updateStopsDomOnly();

  function rebuildStopsDom() {
    gradBar.innerHTML = "";
    for (const s of state.background.stops) {
      const el = document.createElement("div");
      el.className = "stop";
      el.dataset.id = s.id;
      el.title = `${s.color} @ ${s.pos}%`;
      gradBar.appendChild(el);

      el.addEventListener("click", () => {
        state.ui.activeStopId = s.id;
        syncActiveStopControls();
        updateStopsDomOnly();
        renderAll();
      });
    }
    updateStopsDomOnly();
  }

  function updateStopsDomOnly() {
    const active = state.ui.activeStopId;
    for (const s of state.background.stops) {
      const el = gradBar.querySelector(`.stop[data-id="${s.id}"]`);
      if (!el) continue;
      el.style.left = `${s.pos}%`;
      el.style.background = s.color;
      el.dataset.active = s.id === active ? "true" : "false";
      el.title = `${s.color} @ ${s.pos}%`;
    }
  }

  function syncActiveStopControls() {
    const s = getActiveStop();
    if (!s) return;
    stopColor.value = s.color;
    stopColorHex.value = s.color;
    stopPos.value = String(s.pos);
  }

  function getActiveStop() {
    return state.background.stops.find(s => s.id === state.ui.activeStopId) || state.background.stops[0];
  }
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function normalizeHex(v) {
  const s = v.trim();
  if (!s) return null;
  const hex = s.startsWith("#") ? s : `#${s}`;
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : null;
}

function applyGradientStyle(style, baseColor = null) {
  const useBaseColor = baseColor && normalizeHex(baseColor);
  
  let colors = [];
  
  switch(style) {
    case "smooth":
      // 2 stops, evenly spaced
      if (useBaseColor) {
        const hsl = hexToHsl(useBaseColor);
        if (hsl.s < 10) {
          // Grayscale smooth
          colors = generateGrayscaleColors(2, hsl.l);
        } else {
          colors = generateSameHueColors(2, hsl.h, hsl.s, hsl.l);
        }
      } else {
        colors = [generateRandomColor(), generateRandomColor()];
      }
      state.background.stops = [
        { id: crypto.randomUUID().slice(0, 6), color: colors[0], pos: 0 },
        { id: crypto.randomUUID().slice(0, 6), color: colors[1], pos: 100 }
      ];
      break;
      
    case "glossy":
      // 3-4 stops with highlight in the middle for glossy effect
      const stopCount = Math.random() > 0.5 ? 3 : 4;
      if (useBaseColor) {
        const hsl = hexToHsl(useBaseColor);
        if (hsl.s < 10) {
          // Grayscale glossy
          colors = generateGrayscaleColors(stopCount, hsl.l);
        } else {
          colors = generateSameHueColors(stopCount, hsl.h, hsl.s, hsl.l);
        }
      } else {
        colors = Array(stopCount).fill(0).map(() => generateRandomColor());
      }
      
      if (stopCount === 3) {
        // Dark -> light -> dark
        state.background.stops = [
          { id: crypto.randomUUID().slice(0, 6), color: adjustLightness(colors[0], -15), pos: 0 },
          { id: crypto.randomUUID().slice(0, 6), color: adjustLightness(colors[1], 20), pos: 50 },
          { id: crypto.randomUUID().slice(0, 6), color: adjustLightness(colors[2], -15), pos: 100 }
        ];
      } else {
        state.background.stops = [
          { id: crypto.randomUUID().slice(0, 6), color: colors[0], pos: 0 },
          { id: crypto.randomUUID().slice(0, 6), color: adjustLightness(colors[1], 25), pos: 35 },
          { id: crypto.randomUUID().slice(0, 6), color: adjustLightness(colors[2], 15), pos: 65 },
          { id: crypto.randomUUID().slice(0, 6), color: colors[3], pos: 100 }
        ];
      }
      break;
      
    case "vibrant":
      // 3-4 stops with high saturation
      if (useBaseColor) {
        const hsl = hexToHsl(useBaseColor);
        if (hsl.s < 10) {
          // Can't make grayscale vibrant, so add color
          const randomHue = Math.random() * 360;
          colors = Array(3).fill(0).map((_, i) => 
            hslToHex(randomHue, 80 + Math.random() * 15, 40 + (i * 15))
          );
        } else {
          colors = generateSameHueColors(3, hsl.h, hsl.s, hsl.l).map(c => adjustSaturation(c, 30));
        }
      } else {
        colors = Array(3).fill(0).map(() => adjustSaturation(generateRandomColor(), 25));
      }
      state.background.stops = [
        { id: crypto.randomUUID().slice(0, 6), color: colors[0], pos: 0 },
        { id: crypto.randomUUID().slice(0, 6), color: colors[1], pos: 50 },
        { id: crypto.randomUUID().slice(0, 6), color: colors[2], pos: 100 }
      ];
      break;
      
    case "subtle":
      // 2-3 stops with low saturation variation
      const subtleCount = Math.random() > 0.6 ? 3 : 2;
      if (useBaseColor) {
        const hsl = hexToHsl(useBaseColor);
        colors = Array(subtleCount).fill(0).map((_, i) => {
          const lightDelta = (i / (subtleCount - 1)) * 20 - 10;
          return hslToHex(hsl.h, Math.max(5, hsl.s - 15), Math.max(20, Math.min(80, hsl.l + lightDelta)));
        });
      } else {
        const baseHue = Math.random() * 360;
        colors = Array(subtleCount).fill(0).map((_, i) => 
          hslToHex(baseHue, 30 + Math.random() * 20, 45 + (i * 15))
        );
      }
      state.background.stops = colors.map((color, i) => ({
        id: crypto.randomUUID().slice(0, 6),
        color,
        pos: Math.round((i / (subtleCount - 1)) * 100)
      }));
      break;
  }
  
  state.ui.activeStopId = state.background.stops[0].id;
}

function randomizeGradient(baseColor = null, style = null) {
  if (style) {
    // If a style is selected, use that
    applyGradientStyle(style, baseColor);
    return;
  }
  
  // Random type (70% linear, 30% radial for better aesthetics)
  state.background.type = Math.random() > 0.3 ? "linear" : "radial";
  
  // Random angle (prefer common angles)
  const commonAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  state.background.angle = Math.random() > 0.3 
    ? commonAngles[Math.floor(Math.random() * commonAngles.length)]
    : Math.floor(Math.random() * 360);
  
  // Random number of stops (2-4 stops look best)
  const stopCount = Math.floor(Math.random() * 3) + 2; // 2-4 stops
  
  let colors = [];
  
  if (baseColor) {
    // If base color provided, generate gradient based on it
    const baseHsl = hexToHsl(baseColor);
    
    // Check if color is grayscale (low saturation)
    if (baseHsl.s < 10) {
      // Generate grayscale gradient
      colors = generateGrayscaleColors(stopCount, baseHsl.l);
    } else {
      // Generate colors in the same hue family
      colors = generateSameHueColors(stopCount, baseHsl.h, baseHsl.s, baseHsl.l);
    }
  } else {
    // Generate color palette using different strategies
    const strategy = Math.floor(Math.random() * 4);
    
    switch(strategy) {
      case 0: // Analogous colors (similar hues)
        colors = generateAnalogousColors(stopCount);
        break;
      case 1: // Complementary colors
        colors = generateComplementaryColors(stopCount);
        break;
      case 2: // Monochromatic (same hue, different saturation/lightness)
        colors = generateMonochromaticColors(stopCount);
        break;
      case 3: // Random vibrant
        colors = generateVibrantColors(stopCount);
        break;
    }
  }
  
  // Create stops with even distribution
  state.background.stops = colors.map((color, i) => ({
    id: crypto.randomUUID().slice(0, 6),
    color: color,
    pos: Math.round((i / (stopCount - 1)) * 100)
  }));
  
  state.ui.activeStopId = state.background.stops[0].id;
}

function generateAnalogousColors(count, baseHue = null) {
  const hue = baseHue !== null ? baseHue : Math.floor(Math.random() * 360);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const h = (hue + (i * 30)) % 360; // 30 degree spread
    const sat = 60 + Math.random() * 30; // 60-90%
    const light = 45 + Math.random() * 20; // 45-65%
    colors.push(hslToHex(h, sat, light));
  }
  return colors;
}

function generateComplementaryColors(count, baseHue = null) {
  const hue = baseHue !== null ? baseHue : Math.floor(Math.random() * 360);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const h = i % 2 === 0 ? hue : (hue + 180) % 360;
    const sat = 65 + Math.random() * 25;
    const light = 50 + Math.random() * 15;
    colors.push(hslToHex(h, sat, light));
  }
  return colors;
}

function generateMonochromaticColors(count, baseHue = null) {
  const hue = baseHue !== null ? baseHue : Math.floor(Math.random() * 360);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const sat = 50 + (i * (40 / count));
    const light = 35 + (i * (35 / count));
    colors.push(hslToHex(hue, sat, light));
  }
  return colors;
}

function generateVibrantColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor(Math.random() * 360);
    const sat = 70 + Math.random() * 25; // 70-95% vibrant
    const light = 45 + Math.random() * 20; // 45-65%
    colors.push(hslToHex(hue, sat, light));
  }
  return colors;
}

function generateGrayscaleColors(count, baseLightness) {
  const colors = [];
  // Generate grayscale colors spanning from dark to light
  for (let i = 0; i < count; i++) {
    // Create a range around the base lightness
    const minLight = Math.max(5, baseLightness - 35);
    const maxLight = Math.min(95, baseLightness + 35);
    const range = maxLight - minLight;
    const light = minLight + (i / (count - 1)) * range;
    colors.push(hslToHex(0, 0, light)); // Hue and saturation at 0 for grayscale
  }
  return colors;
}

function generateSameHueColors(count, baseHue, baseSat, baseLight) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    // Keep the hue similar (±5 degrees variation for slight depth)
    const hue = (baseHue + (Math.random() * 10 - 5) + 360) % 360;
    
    // Vary saturation and lightness for depth while staying in the same color family
    const satVariation = Math.random() * 30 - 15; // ±15%
    const sat = Math.max(30, Math.min(100, baseSat + satVariation));
    
    const lightVariation = (i / (count - 1)) * 40 - 20; // Spread across range
    const light = Math.max(25, Math.min(75, baseLight + lightVariation));
    
    colors.push(hslToHex(hue, sat, light));
  }
  return colors;
}

function generateRandomColor() {
  const hue = Math.random() * 360;
  const sat = 60 + Math.random() * 30;
  const light = 45 + Math.random() * 20;
  return hslToHex(hue, sat, light);
}

function adjustLightness(hex, delta) {
  const hsl = hexToHsl(hex);
  const newLight = Math.max(0, Math.min(100, hsl.l + delta));
  return hslToHex(hsl.h, hsl.s, newLight);
}

function adjustSaturation(hex, delta) {
  const hsl = hexToHsl(hex);
  const newSat = Math.max(0, Math.min(100, hsl.s + delta));
  return hslToHex(hsl.h, newSat, hsl.l);
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
