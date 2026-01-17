export const state = {
  icon: {
    name: null,
    svgText: null,
    exportName: ""
  },

  background: {
    type: "linear", // "linear" | "radial"
    angle: 135,
    stops: [
      { id: "a", color: "#ff0000", pos: 0 },   // Red
      { id: "b", color: "#00ff00", pos: 50 },  // Green
      { id: "c", color: "#0000ff", pos: 100 }  // Blue
    ]
  },

  iconStyle: {
    color: "#ffffff",
    sizePct: 44,     // percentage of tile (approx)
    yOffsetPct: 0    // percentage of tile
  },

  export: {
    size: 256,
    radius: 18
  },

  ui: {
    activeStopId: "b",
    zoom: 1,
    colorMode: "rgb" // "rgb" | "hsl"
  }
};
