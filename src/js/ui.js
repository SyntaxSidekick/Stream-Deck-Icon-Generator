import { state } from "./state.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const smallIconPreview = document.getElementById("smallIconPreview");
const selectedIconName = document.getElementById("selectedIconName");
const selectedIconHint = document.getElementById("selectedIconHint");
const previewLabel = document.getElementById("previewLabel");
const canvasWrap = document.getElementById("canvasWrap");

const iconColor = document.getElementById("iconColor");
const iconColorHex = document.getElementById("iconColorHex");
const iconSize = document.getElementById("iconSize");
const iconOffset = document.getElementById("iconOffset");

const zoomGroup = document.getElementById("zoomGroup");
const angleRange = document.getElementById("angle");
const radiusRange = document.getElementById("radius");
const exportSize = document.getElementById("exportSize");

const gradBar = document.getElementById("gradBar");

let iconImage = null;
let iconImageUrl = null;

export function initUiBindings() {
  // icon style controls
  iconColor.addEventListener("input", () => setIconColor(iconColor.value));
  iconColorHex.addEventListener("input", () => {
    const v = normalizeHex(iconColorHex.value);
    if (v) setIconColor(v);
  });
  iconSize.addEventListener("input", () => {
    const val = Number(iconSize.value);
    state.iconStyle.sizePct = val;
    iconSize.setAttribute("aria-valuenow", String(val));
    updateRangeLabel("iconSizeValue", iconSize.value, "%");
    renderAll();
  });
  iconOffset.addEventListener("input", () => {
    const val = Number(iconOffset.value);
    state.iconStyle.yOffsetPct = val;
    iconOffset.setAttribute("aria-valuenow", String(val));
    updateRangeLabel("iconOffsetValue", iconOffset.value, "%");
    renderAll();
  });
  const iconNameInput = document.getElementById("iconNameInput");
  iconNameInput.addEventListener("input", () => {
    state.icon.exportName = sanitizeName(iconNameInput.value);
  });


  // zoom controls (visual only)
  zoomGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;

  const zoom = Number(btn.dataset.zoom);

  zoomGroup.querySelectorAll(".chip").forEach(b => {
    const isActive = b === btn;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  state.ui.zoom = zoom;

  canvasWrap.style.transform = zoom === 1
    ? "none"
    : `scale(${zoom})`;

  canvasWrap.style.transformOrigin = "center";
});


  // reset
  document.getElementById("resetAll").addEventListener("click", () => {
    state.background.type = "linear";
    state.background.angle = 135;
    state.background.stops = [
      { id: "a", color: "#ff7a18", pos: 0 },
      { id: "b", color: "#ffb347", pos: 50 },
      { id: "c", color: "#44B0B9", pos: 100 }
    ];
    state.ui.activeStopId = "b";
    state.iconStyle.color = "#ffffff";
    state.iconStyle.sizePct = 44;
    state.iconStyle.yOffsetPct = 0;
    state.export.size = 256;
    state.export.radius = 18;

    // update form inputs (best effort)
    iconColor.value = state.iconStyle.color;
    iconColorHex.value = state.iconStyle.color;
    iconSize.value = String(state.iconStyle.sizePct);
    iconOffset.value = String(state.iconStyle.yOffsetPct);
    angleRange.value = String(state.background.angle);
    radiusRange.value = String(state.export.radius);
    exportSize.value = String(state.export.size);

    renderAll(true);
  });

  // export settings preview label
  exportSize.addEventListener("change", () => {
    state.export.size = Number(exportSize.value);
    previewLabel.textContent = `${state.export.size} × ${state.export.size}`;
  });

  radiusRange.addEventListener("input", () => {
    const val = Number(radiusRange.value);
    state.export.radius = val;
    radiusRange.setAttribute("aria-valuenow", String(val));
    updateRangeLabel("radiusValue", String(val), "px");
    renderAll();
  });

  // keep grad bar background in sync
  renderAll(true);
}

function setIconColor(color) {
  state.iconStyle.color = color;
  iconColor.value = color;
  iconColorHex.value = color;
  renderAll(true);
}

export async function setSelectedIcon(svgText) {
  if (!svgText) return;

  // update left preview + label
  selectedIconName.textContent = state.icon.name || "Selected";
  selectedIconHint.textContent = "";

  // render small preview as inline SVG
  smallIconPreview.innerHTML = svgText;
  const s = smallIconPreview.querySelector("svg");
  if (s) {
    s.setAttribute("width", "22");
    s.setAttribute("height", "22");
    s.style.display = "block";
    s.style.fill = "rgba(255,255,255,.85)";
  }

  // Update export name to match the selected icon (unless user manually changed it)
  const iconNameInput = document.getElementById("iconNameInput");
  if (state.icon.name) {
    // If exportName is empty or matches a previous icon, update it to new icon
    if (!state.icon.exportName || state.icon.exportName === iconNameInput.value) {
      state.icon.exportName = state.icon.name;
      iconNameInput.value = state.icon.name;
    }
  }

  // build colored svg image for canvas
  const coloredSvg = recolorSvg(svgText, state.iconStyle.color);
  iconImage = await svgToImage(coloredSvg);
  renderAll();
}

export function renderAll(forceReloadIcon = false) {
  // update gradient CSS previews
  const css = buildCssGradient();
  if (gradBar) gradBar.style.background = css;

  // if icon exists and color changed, rebuild icon image
  if (state.icon.svgText && (forceReloadIcon || iconNeedsRefresh())) {
    // fire and forget (safe)
    setSelectedIcon(state.icon.svgText);
    // setSelectedIcon will call renderAll again
    return;
  }

  drawToCanvas(state.export.size);
}

function iconNeedsRefresh() {
  // naive: always refresh when called with forceReloadIcon
  // otherwise: keep it simple — recolor on any renderAll if svg exists and iconImage not ready
  return !iconImage;
}

/* =========================
   Canvas drawing
========================= */

export function drawToCanvas(size) {
  canvas.width = size;
  canvas.height = size;

  const radius = clamp(state.export.radius, 0, Math.floor(size / 2));

  // clip rounded rect
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  roundedRectPath(ctx, 0, 0, size, size, radius);
  ctx.clip();

  // background gradient
  ctx.fillStyle = buildCanvasGradient(ctx, size);
  ctx.fillRect(0, 0, size, size);

  // icon
  if (iconImage) {
    const iconPct = clamp(state.iconStyle.sizePct, 10, 90) / 100;
    const iconSizePx = Math.floor(size * iconPct);

    const x = Math.floor((size - iconSizePx) / 2);
    const yOffset = Math.floor((state.iconStyle.yOffsetPct / 100) * size);
    const y = Math.floor((size - iconSizePx) / 2 + yOffset);

    ctx.drawImage(iconImage, x, y, iconSizePx, iconSizePx);
  }

  ctx.restore();
}

/* =========================
   Gradient builders
========================= */

function buildCssGradient() {
  const { type, angle, stops } = state.background;
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopString = sorted.map(s => `${s.color} ${s.pos}%`).join(", ");
  return type === "radial"
    ? `radial-gradient(circle, ${stopString})`
    : `linear-gradient(${angle}deg, ${stopString})`;
}

function buildCanvasGradient(ctx, size) {
  const { type, angle, stops } = state.background;
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);

  if (type === "radial") {
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    for (const s of sorted) g.addColorStop(clamp01(s.pos / 100), s.color);
    return g;
  }

  const rad = (angle * Math.PI) / 180;
  // direction vector
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);

  // line across the square centered at center
  const cx = size / 2;
  const cy = size / 2;
  const half = size / 2;

  // scale so the line reaches corners
  const scale = half * Math.SQRT2;
  const x0 = cx - dx * scale;
  const y0 = cy - dy * scale;
  const x1 = cx + dx * scale;
  const y1 = cy + dy * scale;

  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const s of sorted) g.addColorStop(clamp01(s.pos / 100), s.color);
  return g;
}

/* =========================
   SVG -> Image (recolor)
========================= */

function recolorSvg(svgText, color) {
  // DOM parse → set currentColor usage → set root color → prefer fills to currentColor
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;

  // ensure viewBox
  if (!svg.getAttribute("viewBox")) {
    const w = svg.getAttribute("width") || "24";
    const h = svg.getAttribute("height") || "24";
    svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
  }

  // force sizing to avoid 0x0 images
  svg.setAttribute("width", "256");
  svg.setAttribute("height", "256");

  // set currentColor
  svg.style.color = color;
  // remove hard-coded fills where possible, set to currentColor except fill="none"
  const all = svg.querySelectorAll("*");
  all.forEach(el => {
    const fill = el.getAttribute("fill");
    if (fill && fill.toLowerCase() === "none") return;
    // if it has a fill, override to currentColor (brands are usually single-color)
    if (fill) el.setAttribute("fill", "currentColor");
    // if no fill but is a path, set it too
    if (!fill && el.tagName.toLowerCase() === "path") el.setAttribute("fill", "currentColor");
  });
  // also set root fill to currentColor (fallback)
  svg.setAttribute("fill", "currentColor");

  return new XMLSerializer().serializeToString(svg);
}

async function svgToImage(svgText) {
  // revoke old URL
  if (iconImageUrl) URL.revokeObjectURL(iconImageUrl);

  const blob = new Blob([svgText], { type: "image/svg+xml" });
  iconImageUrl = URL.createObjectURL(blob);

  const img = new Image();
  img.decoding = "async";

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = iconImageUrl;
  });

  return img;
}

/* =========================
   Utils
========================= */

function roundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function clamp01(n){ return Math.max(0, Math.min(1, n)); }

function normalizeHex(v) {
  const s = v.trim();
  if (!s) return null;
  const hex = s.startsWith("#") ? s : `#${s}`;
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : null;
}

function sanitizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function updateRangeLabel(labelId, value, suffix = "") {
  const label = document.getElementById(labelId);
  if (label) label.textContent = `${value}${suffix}`;
}
