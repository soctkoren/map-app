import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet";
import html2canvas from "html2canvas";
const SVG_ICONS = {
  mapPin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  graduation: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
};
const SvgIconSelector = ({ selectedIcon, onSelectIcon }) => {
  const iconNames = Object.keys(SVG_ICONS);
  const getIconDisplayName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim();
  };
  return /* @__PURE__ */ jsx("div", { className: "map-pins-grid", children: iconNames.map((iconName) => /* @__PURE__ */ jsx(
    "button",
    {
      className: `map-pin-button ${SVG_ICONS[iconName] === selectedIcon ? "selected" : ""}`,
      onClick: () => onSelectIcon(SVG_ICONS[iconName]),
      title: getIconDisplayName(iconName),
      children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: SVG_ICONS[iconName] }) })
    },
    iconName
  )) });
};
const AVAILABLE_FONTS$1 = [
  { name: "ABeeZee", value: "ABeeZee" },
  { name: "Roboto", value: "Roboto" },
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Helvetica", value: "Helvetica" }
];
const DEFAULT_TEXT = {
  id: "",
  text: "",
  x: 0,
  y: 0,
  fontSize: 100,
  color: "#000000",
  rotation: 0,
  fontFamily: "Roboto"
};
const LayerEditor = ({ overlay, onUpdate, onClose, isNew = false, position }) => {
  const [fontSize, setFontSize] = useState((overlay == null ? void 0 : overlay.fontSize) ?? 100);
  const [textColor, setTextColor] = useState((overlay == null ? void 0 : overlay.color) ?? "#000000");
  const [rotation, setRotation] = useState((overlay == null ? void 0 : overlay.rotation) ?? 0);
  const [text, setText] = useState((overlay == null ? void 0 : overlay.text) ?? "");
  const [fontFamily, setFontFamily] = useState((overlay == null ? void 0 : overlay.fontFamily) ?? "Roboto");
  if (!overlay) {
    return null;
  }
  const snapRotation = (value) => {
    const snapPoints = [0, 45, 90, 135, 180, -180, -135, -90, -45];
    const snapThreshold = 5;
    for (const point of snapPoints) {
      if (Math.abs(value - point) <= snapThreshold) {
        return point;
      }
    }
    return value;
  };
  const handleRotationChange = (e) => {
    const newRotation = Number(e.target.value);
    const snappedRotation = snapRotation(newRotation);
    setRotation(snappedRotation);
    onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath : text, {
      fontSize,
      color: textColor,
      rotation: snappedRotation,
      fontFamily
    });
  };
  const handleUpdate = () => {
    onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath : text, {
      fontSize,
      color: textColor,
      rotation,
      fontFamily
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "layer-editor-popup", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "layer-editor-content",
      style: position ? { top: position } : void 0,
      children: [
        /* @__PURE__ */ jsx("h4", { children: isNew ? overlay.isSvg ? "Add New Icon" : "Add New Text" : "Edit Layer" }),
        !overlay.isSvg && /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
          /* @__PURE__ */ jsxs("label", { className: "field-label", children: [
            "Text ",
            /* @__PURE__ */ jsx("span", { className: "instruction-text", children: "(Right-click drag to move text on map)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: text,
              onChange: (e) => {
                setText(e.target.value);
                onUpdate(overlay.id, e.target.value, {
                  fontSize,
                  color: textColor,
                  rotation,
                  fontFamily
                });
              },
              placeholder: "Enter text...",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "style-controls", children: [
          overlay.isSvg ? /* @__PURE__ */ jsxs("div", { className: "size-control", children: [
            /* @__PURE__ */ jsxs("label", { children: [
              "Size",
              /* @__PURE__ */ jsxs("span", { children: [
                fontSize,
                "px"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                className: "size-slider",
                min: "16",
                max: "96",
                value: fontSize,
                onChange: (e) => {
                  const newSize = parseInt(e.target.value);
                  setFontSize(newSize);
                  onUpdate(overlay.id, overlay.svgPath, {
                    fontSize: newSize,
                    color: textColor,
                    rotation,
                    fontFamily
                  });
                }
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Font Family" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: fontFamily,
                  onChange: (e) => {
                    setFontFamily(e.target.value);
                    onUpdate(overlay.id, text, {
                      fontSize,
                      color: textColor,
                      rotation,
                      fontFamily: e.target.value
                    });
                  },
                  className: "font-select",
                  children: AVAILABLE_FONTS$1.map((font) => /* @__PURE__ */ jsx("option", { value: font.value, style: { fontFamily: font.value }, children: font.name }, font.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Font Size" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: fontSize,
                  onChange: (e) => {
                    const newSize = e.target.value === "" ? 0 : parseInt(e.target.value);
                    if (!isNaN(newSize)) {
                      setFontSize(newSize);
                      onUpdate(overlay.id, text, {
                        fontSize: newSize,
                        color: textColor,
                        rotation,
                        fontFamily
                      });
                    }
                  },
                  min: "0",
                  max: "200",
                  step: "1"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Color" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "color",
                value: textColor,
                onChange: (e) => {
                  setTextColor(e.target.value);
                  handleUpdate();
                },
                title: overlay.isSvg ? "Icon color" : "Text color"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rotation-control", children: [
            /* @__PURE__ */ jsxs("div", { className: "rotation-label", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Rotation: ",
                rotation,
                "°"
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "reset-rotation",
                  onClick: () => {
                    setRotation(0);
                    onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath : text, {
                      fontSize,
                      color: textColor,
                      rotation: 0,
                      fontFamily
                    });
                  },
                  children: "Reset"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rotation-slider-container", children: [
              /* @__PURE__ */ jsxs("div", { className: "angle-markers", children: [
                /* @__PURE__ */ jsx("span", { children: "-180°" }),
                /* @__PURE__ */ jsx("span", { children: "-90°" }),
                /* @__PURE__ */ jsx("span", { children: "0°" }),
                /* @__PURE__ */ jsx("span", { children: "90°" }),
                /* @__PURE__ */ jsx("span", { children: "180°" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  value: rotation,
                  onChange: handleRotationChange,
                  min: "-180",
                  max: "180",
                  step: "1",
                  className: "rotation-slider"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "angle-ticks", children: [
                /* @__PURE__ */ jsx("div", { className: "tick", style: { left: "0%" } }),
                /* @__PURE__ */ jsx("div", { className: "tick", style: { left: "25%" } }),
                /* @__PURE__ */ jsx("div", { className: "tick", style: { left: "50%" } }),
                /* @__PURE__ */ jsx("div", { className: "tick", style: { left: "75%" } }),
                /* @__PURE__ */ jsx("div", { className: "tick", style: { left: "100%" } })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "close-editor-btn", onClick: onClose, children: "Done" })
      ]
    }
  ) });
};
const MapControls = ({
  onAddText,
  onUpdateText,
  onDeleteText,
  textOverlays,
  selectedPosterSize,
  onPosterSizeChange,
  onCapture,
  mapStyles,
  selectedMapStyle,
  onMapStyleChange,
  onLocationChange
}) => {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [isAddingNewText, setIsAddingNewText] = useState(false);
  const [editorPosition, setEditorPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [showSizes, setShowSizes] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching for location:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };
  const handleLocationSelect = (result) => {
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onLocationChange(parseFloat(result.lat), parseFloat(result.lon));
  };
  const handleEditLayer = (id, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const editorHeight = 420;
    const windowHeight = window.innerHeight;
    const padding = 20;
    let safePosition = Math.max(
      padding + editorHeight / 2,
      // Don't go above screen
      Math.min(
        buttonRect.top,
        // Desired position
        windowHeight - padding - editorHeight / 2
        // Don't go below screen
      )
    );
    setEditorPosition(safePosition);
    setSelectedLayerId(id);
    setIsAddingNewText(false);
  };
  const handleStartAddText = () => {
    const id = Date.now().toString();
    const newText = { ...DEFAULT_TEXT };
    onAddText(newText.text, {
      fontSize: newText.fontSize,
      color: newText.color,
      rotation: newText.rotation,
      fontFamily: newText.fontFamily
    });
    setSelectedLayerId(id);
    setIsAddingNewText(true);
  };
  const handleCloseEditor = () => {
    setSelectedLayerId(null);
    setIsAddingNewText(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "map-controls", children: [
    /* @__PURE__ */ jsxs("div", { className: "controls-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "site-title", children: [
        /* @__PURE__ */ jsx("svg", { className: "logo", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx(
          "path",
          {
            d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fill: "currentColor"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "title-text", children: [
          /* @__PURE__ */ jsx("h1", { children: "Momenti Maps" }),
          /* @__PURE__ */ jsx("p", { children: "Create beautiful map prints" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "search-section", children: [
        /* @__PURE__ */ jsx("h3", { children: "Search Location" }),
        /* @__PURE__ */ jsxs("div", { className: "search-container", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "search-input",
              placeholder: "Search Location",
              value: searchQuery,
              onChange: (e) => handleSearch(e.target.value)
            }
          ),
          isSearching && /* @__PURE__ */ jsx("div", { className: "search-loading" }),
          searchResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "search-results", children: searchResults.map((result, index) => /* @__PURE__ */ jsx(
            "button",
            {
              className: "search-result-item",
              onClick: () => handleLocationSelect(result),
              children: result.display_name
            },
            index
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "control-section", children: [
        /* @__PURE__ */ jsx("h3", { children: "Map Style" }),
        /* @__PURE__ */ jsx("div", { className: "style-selector", children: /* @__PURE__ */ jsx(
          "select",
          {
            value: selectedMapStyle.name,
            onChange: (e) => {
              const style = mapStyles.find((s) => s.name === e.target.value);
              if (style) onMapStyleChange(style);
            },
            children: mapStyles.map((style) => /* @__PURE__ */ jsx("option", { value: style.name, children: style.name }, style.name))
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "control-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-controls-header", children: [
          /* @__PURE__ */ jsx("h3", { children: "Add Content" }),
          /* @__PURE__ */ jsx("button", { className: "add-text-btn", onClick: handleStartAddText, children: "Add Text" }),
          /* @__PURE__ */ jsx(
            SvgIconSelector,
            {
              selectedIcon: "",
              onSelectIcon: (iconPath) => onAddText(iconPath, {
                fontSize: 48,
                color: "#0066FF",
                rotation: 0,
                fontFamily: "sans-serif",
                isSvg: true
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-layers", children: textOverlays.map((overlay) => /* @__PURE__ */ jsxs("div", { className: "text-layer", children: [
          /* @__PURE__ */ jsx("div", { className: "layer-preview", children: overlay.isSvg ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "layer-icon", fill: overlay.color || "currentColor", children: /* @__PURE__ */ jsx("path", { d: overlay.svgPath }) }),
            /* @__PURE__ */ jsx("span", { children: "Map Icon" })
          ] }) : /* @__PURE__ */ jsx("span", { children: overlay.text }) }),
          /* @__PURE__ */ jsxs("div", { className: "layer-actions", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "edit-layer-btn",
                onClick: (e) => handleEditLayer(overlay.id, e),
                "aria-label": "Edit layer",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z", fill: "currentColor" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "delete-text-btn",
                onClick: () => onDeleteText(overlay.id),
                "aria-label": "Delete layer",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z", fill: "currentColor" }) })
              }
            )
          ] })
        ] }, overlay.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "capture-button-container", children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: `capture-btn ${isCapturing ? "capturing" : ""}`,
        onClick: onCapture,
        disabled: isCapturing,
        children: [
          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M12 16l4-4h-3V3h-2v9H8l4 4zm9-13h-6v1.99h6v14.03H3V4.99h6V3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z", fill: "currentColor" }) }),
          isCapturing ? "Capturing..." : "Capture Map"
        ]
      }
    ) }),
    selectedLayerId && textOverlays.find((o) => o.id === selectedLayerId) && /* @__PURE__ */ jsx(
      LayerEditor,
      {
        overlay: textOverlays.find((o) => o.id === selectedLayerId),
        onUpdate: onUpdateText,
        onClose: handleCloseEditor,
        isNew: isAddingNewText,
        position: editorPosition
      }
    )
  ] });
};
const DEFAULT_CENTER = [51.505, -0.09];
const DEFAULT_ZOOM = 13;
const SNAP_THRESHOLD = 20;
const CENTER_GUIDE_COLOR = "rgba(0, 120, 255, 0.6)";
const NATURE_BACKGROUNDS = [
  {
    url: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7",
    credit: "Nathan Anderson",
    description: "Mountain camping at night"
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    credit: "Kalen Emsley",
    description: "Mountain peaks and clouds"
  },
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    credit: "Benjamin Voros",
    description: "Starry night over mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1511497584788-876760111969",
    credit: "Fabian Quintero",
    description: "Northern lights over mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1682686580391-615b1f28e5ee",
    credit: "Marek Piwnicki",
    description: "Misty mountain valley"
  },
  {
    url: "https://images.unsplash.com/photo-1682686580186-b55d0f3d8e6d",
    credit: "Jonatan Pie",
    description: "Aurora over mountains"
  }
];
const getRandomBackground = () => {
  const randomIndex = Math.floor(Math.random() * NATURE_BACKGROUNDS.length);
  return NATURE_BACKGROUNDS[randomIndex];
};
const loadGoogleFont = async (fontFamily) => {
  try {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const testSpan = document.createElement("span");
    testSpan.style.fontFamily = fontFamily;
    testSpan.style.position = "absolute";
    testSpan.style.visibility = "hidden";
    testSpan.textContent = "Test Font Loading";
    document.body.appendChild(testSpan);
    await Promise.race([
      document.fonts.load(`700 16px "${fontFamily}"`),
      document.fonts.load(`400 16px "${fontFamily}"`),
      new Promise((resolve) => setTimeout(resolve, 3e3))
      // 3s timeout
    ]);
    document.body.removeChild(testSpan);
  } catch (error) {
    console.error(`Error loading font ${fontFamily}:`, error);
  }
};
const AVAILABLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Raleway",
  "Poppins",
  "Playfair Display",
  "Source Sans Pro",
  "ABeeZee"
];
const MAP_STYLES = [
  {
    name: "OSM Default",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: "OSM Bright",
    url: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    name: "Dark Matter",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    name: "Positron",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }
];
const MapOperations = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
};
const Map = () => {
  var _a, _b;
  const [textOverlays, setTextOverlays] = useState([]);
  const [selectedPosterSize, setSelectedPosterSize] = useState({
    name: '18x24"',
    width: 18,
    height: 24,
    pixelWidth: 5400,
    pixelHeight: 7200
  });
  const [selectedMapStyle, setSelectedMapStyle] = useState(
    MAP_STYLES.find((style) => style.name === "Positron") || MAP_STYLES[0]
  );
  const [currentBackground] = useState(getRandomBackground());
  const [viewportStyle, setViewportStyle] = useState({
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%"
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const printViewportRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    textId: "",
    textX: 0,
    textY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const [showCenterGuides, setShowCenterGuides] = useState({ x: false, y: false });
  useEffect(() => {
    const updateViewportSize = () => {
      const container = document.querySelector(".map-container");
      if (!container) return;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = selectedPosterSize.width / selectedPosterSize.height;
      let width, height;
      if (containerWidth / containerHeight > aspectRatio) {
        height = containerHeight * 0.9;
        width = height * aspectRatio;
      } else {
        width = containerWidth * 0.9;
        height = width / aspectRatio;
      }
      setViewportStyle({
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
        maxHeight: "100%"
      });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [selectedPosterSize]);
  const handleMapReady = (map) => {
    mapInstanceRef.current = map;
  };
  const calculateScaledFontSize = (fontSize) => {
    if (!printViewportRef.current) return fontSize;
    const viewportWidth = printViewportRef.current.clientWidth;
    const scaleFactor = viewportWidth / 1e3;
    return fontSize * scaleFactor;
  };
  const handleAddText = (text, style) => {
    const viewport = printViewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const newText = {
      id: Date.now().toString(),
      text: style.isSvg ? "" : text || "",
      x: rect.width / 2,
      // Center horizontally
      y: style.isSvg ? rect.height / 2 : rect.height * 0.8,
      // Place icons in center, text near bottom
      fontSize: style.fontSize || (style.isEmoji ? 48 : 100),
      color: style.color || "#0066FF",
      // Default to blue for icons
      rotation: style.rotation || 0,
      fontFamily: style.fontFamily || "Roboto",
      isEmoji: style.isEmoji || false,
      isSvg: style.isSvg || false,
      svgPath: style.isSvg ? text : void 0
    };
    setTextOverlays((prevOverlays) => [...prevOverlays, newText]);
    if (style.isSvg) {
      setDraggingId(newText.id);
    }
  };
  const handleUpdateText = (id, text, style) => {
    setTextOverlays(
      (overlays) => overlays.map(
        (overlay) => overlay.id === id ? {
          ...overlay,
          text: style.isSvg ? overlay.text : text,
          svgPath: style.isSvg ? text : overlay.svgPath,
          fontSize: style.fontSize,
          color: style.color,
          rotation: style.rotation,
          fontFamily: style.fontFamily
        } : overlay
      )
    );
  };
  const handleDeleteText = (id) => {
    setTextOverlays((overlays) => overlays.filter((overlay) => overlay.id !== id));
  };
  const handlePosterSizeChange = (size) => {
    setSelectedPosterSize(size);
  };
  const handleMapStyleChange = (style) => {
    setSelectedMapStyle(style);
  };
  const handleMouseDown = (e, overlay) => {
    var _a2;
    e.preventDefault();
    const rect = (_a2 = printViewportRef.current) == null ? void 0 : _a2.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - rect.left - overlay.x;
    const offsetY = e.clientY - rect.top - overlay.y;
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      textId: overlay.id,
      textX: overlay.x,
      textY: overlay.y,
      offsetX,
      offsetY
    };
    setDraggingId(overlay.id);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!dragStateRef.current.isDragging || !printViewportRef.current) return;
    const rect = printViewportRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragStateRef.current.offsetX;
    let newY = e.clientY - rect.top - dragStateRef.current.offsetY;
    const overlay = textOverlays.find((o) => o.id === dragStateRef.current.textId);
    if (!overlay) return;
    if (!overlay.isSvg) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (Math.abs(newX - centerX) < SNAP_THRESHOLD) {
        newX = centerX;
        setShowCenterGuides((prev) => ({ ...prev, x: true }));
      } else {
        setShowCenterGuides((prev) => ({ ...prev, x: false }));
      }
      if (Math.abs(newY - centerY) < SNAP_THRESHOLD) {
        newY = centerY;
        setShowCenterGuides((prev) => ({ ...prev, y: true }));
      } else {
        setShowCenterGuides((prev) => ({ ...prev, y: false }));
      }
    }
    setTextOverlays(
      (overlays) => overlays.map(
        (o) => o.id === dragStateRef.current.textId ? { ...o, x: newX, y: newY } : o
      )
    );
  };
  const handleMouseUp = () => {
    dragStateRef.current.isDragging = false;
    setDraggingId(null);
    setShowCenterGuides({ x: false, y: false });
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  const handleContextMenu = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    AVAILABLE_FONTS.forEach(loadGoogleFont);
  }, []);
  const handleCapture = async () => {
    if (!printViewportRef.current || !mapInstanceRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const uniqueFonts = [...new Set(textOverlays.map((overlay) => overlay.fontFamily))];
      await Promise.all(uniqueFonts.map(loadGoogleFont));
      await new Promise((resolve) => setTimeout(resolve, 100));
      const viewport = printViewportRef.current;
      const map = mapInstanceRef.current;
      const { pixelWidth, pixelHeight } = selectedPosterSize;
      const viewportRect = viewport.getBoundingClientRect();
      const scale = pixelWidth / viewportRect.width;
      const canvas = await html2canvas(viewport, {
        scale,
        width: viewportRect.width,
        height: viewportRect.height,
        backgroundColor: null,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedViewport = clonedDoc.querySelector(".print-viewport");
          if (clonedViewport) {
            clonedViewport.style.borderRadius = "0";
            clonedViewport.style.overflow = "hidden";
            const mapContainer = clonedViewport.querySelector(".leaflet-container");
            if (mapContainer) {
              mapContainer.style.borderRadius = "0";
            }
            const controls = clonedViewport.querySelectorAll(".leaflet-control, .print-size-indicator");
            controls.forEach((control) => {
              control.style.display = "none";
            });
            const texts = clonedViewport.querySelectorAll("text");
            texts.forEach((text) => {
              const textElement = text;
              const x = parseFloat(textElement.getAttribute("x") || "0");
              const y = parseFloat(textElement.getAttribute("y") || "0");
              const overlay = textOverlays.find(
                (o) => o.text === textElement.textContent && Math.abs(o.x - x) < 1 && Math.abs(o.y - y) < 1
              );
              if (overlay) {
                const fontSize = parseFloat(textElement.getAttribute("font-size") || "24");
                const fontFamily = `"${overlay.fontFamily}", ${overlay.fontFamily}, sans-serif`;
                textElement.setAttribute("font-size", `${fontSize * scale}px`);
                textElement.setAttribute("font-family", fontFamily);
                textElement.style.setProperty("font-family", fontFamily, "important");
                textElement.style.setProperty("-webkit-font-smoothing", "antialiased", "important");
                textElement.style.setProperty("text-rendering", "optimizeLegibility", "important");
                textElement.setAttribute("fill", overlay.color);
                textElement.style.setProperty("transform", `rotate(${overlay.rotation}deg)`, "important");
                textElement.style.setProperty("text-anchor", "middle", "important");
                textElement.style.setProperty("dominant-baseline", "middle", "important");
                console.log("Applying font:", fontFamily, "to text:", overlay.text);
              } else {
                console.warn("No matching overlay found for text:", textElement.textContent);
              }
            });
          }
        }
      });
      const link = document.createElement("a");
      link.download = `map_${selectedPosterSize.name.replace(/['"]/g, "")}_${pixelWidth}x${pixelHeight}_300dpi.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error capturing map:", error);
    } finally {
      setIsCapturing(false);
    }
  };
  const renderCenterGuides = () => {
    if (!printViewportRef.current) return null;
    const viewport = printViewportRef.current;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      showCenterGuides.x && /* @__PURE__ */ jsx(
        "line",
        {
          x1: centerX,
          y1: 0,
          x2: centerX,
          y2: height,
          stroke: CENTER_GUIDE_COLOR,
          strokeWidth: "1",
          strokeDasharray: "5,5"
        }
      ),
      showCenterGuides.y && /* @__PURE__ */ jsx(
        "line",
        {
          x1: 0,
          y1: centerY,
          x2: width,
          y2: centerY,
          stroke: CENTER_GUIDE_COLOR,
          strokeWidth: "1",
          strokeDasharray: "5,5"
        }
      )
    ] });
  };
  const backgroundUrl = `${currentBackground.url}?auto=format&fit=crop&w=2000&q=80`;
  const handleLocationChange = (lat, lng) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "map-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "social-buttons", children: [
      /* @__PURE__ */ jsx("a", { href: "https://www.linkedin.com/in/jonnykvids/", target: "_blank", rel: "noopener noreferrer", className: "profile-link", children: /* @__PURE__ */ jsx("img", { src: "/me.jpeg", alt: "Profile", className: "profile-image" }) }),
      /* @__PURE__ */ jsx("a", { href: "https://www.paypal.com/donate/?business=W7PELRRREYBSU&no_recurring=0&item_name=That%27s+for+supporting+my+Youtube+Channel&currency_code=USD", target: "_blank", rel: "noopener noreferrer", className: "donate-button", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z", fill: "currentColor" }) }) }),
      /* @__PURE__ */ jsx("a", { href: "https://www.youtube.com/@jonnykvids", target: "_blank", rel: "noopener noreferrer", className: "youtube-button", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", fill: "currentColor" }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "map-container",
        style: {
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)),
            url('${backgroundUrl}')`
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: `print-viewport ${isCapturing ? "capturing" : ""}`,
            ref: printViewportRef,
            style: viewportStyle,
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `help-tooltip ${isCapturing ? "capturing" : ""}`,
                  "data-tooltip": "Welcome to Momenti Maps! 👋\r\n\r\n🗺️ Getting Started:\r\n1. Search for your location in the search bar\r\n2. Choose your preferred map style\r\n3. Add text or icons to your map\r\n4. Customize size, color, and rotation\r\n5. Drag elements to position them\r\n\r\n💡 Pro Tips:\r\n• Text will snap to center when dragged near\r\n• Use the size slider to adjust text/icon scale\r\n• Try different map styles for unique looks\r\n• Choose from various poster sizes\r\n\r\n📸 When you're done:\r\nClick 'Capture Map' to download your creation!",
                  children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z", fill: "currentColor" }) })
                }
              ),
              /* @__PURE__ */ jsxs(
                MapContainer,
                {
                  center: DEFAULT_CENTER,
                  zoom: DEFAULT_ZOOM,
                  style: { width: "100%", height: "100%" },
                  children: [
                    /* @__PURE__ */ jsx(MapOperations, { onMapReady: handleMapReady }),
                    /* @__PURE__ */ jsx(
                      TileLayer,
                      {
                        attribution: selectedMapStyle.attribution,
                        url: selectedMapStyle.url
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "svg",
                      {
                        className: "text-overlay-container",
                        style: {
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          pointerEvents: "none",
                          overflow: "visible",
                          zIndex: 1e3
                        },
                        viewBox: `0 0 ${((_a = printViewportRef.current) == null ? void 0 : _a.clientWidth) || 100} ${((_b = printViewportRef.current) == null ? void 0 : _b.clientHeight) || 100}`,
                        children: [
                          renderCenterGuides(),
                          textOverlays.map((overlay) => overlay.isSvg ? /* @__PURE__ */ jsx(
                            "g",
                            {
                              transform: `translate(${overlay.x}, ${overlay.y})`,
                              style: {
                                cursor: "move",
                                pointerEvents: "auto"
                              },
                              onMouseDown: (e) => handleMouseDown(e, overlay),
                              onContextMenu: handleContextMenu,
                              children: /* @__PURE__ */ jsx(
                                "path",
                                {
                                  d: overlay.svgPath,
                                  fill: overlay.color,
                                  className: draggingId === overlay.id ? "dragging" : "",
                                  style: {
                                    transformOrigin: "center bottom",
                                    transform: `rotate(${overlay.rotation}deg) scale(${overlay.fontSize / 24})`,
                                    transformBox: "fill-box"
                                  }
                                }
                              )
                            },
                            overlay.id
                          ) : /* @__PURE__ */ jsx(
                            "text",
                            {
                              x: overlay.x,
                              y: overlay.y,
                              fontSize: calculateScaledFontSize(overlay.fontSize),
                              fill: overlay.color,
                              className: `${draggingId === overlay.id ? "dragging" : ""} ${overlay.isEmoji ? "emoji-layer" : ""}`,
                              style: {
                                transform: `rotate(${overlay.rotation}deg)`,
                                transformBox: "fill-box",
                                transformOrigin: "50% 50%",
                                cursor: "move",
                                userSelect: "none",
                                fontFamily: overlay.isEmoji ? "sans-serif" : overlay.fontFamily,
                                dominantBaseline: "middle",
                                textAnchor: "middle",
                                pointerEvents: "auto"
                              },
                              onMouseDown: (e) => handleMouseDown(e, overlay),
                              onContextMenu: handleContextMenu,
                              children: overlay.text
                            },
                            overlay.id
                          ))
                        ]
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(
      MapControls,
      {
        onAddText: handleAddText,
        onUpdateText: handleUpdateText,
        onDeleteText: handleDeleteText,
        textOverlays,
        selectedPosterSize,
        onPosterSizeChange: handlePosterSizeChange,
        onCapture: handleCapture,
        mapStyles: MAP_STYLES,
        selectedMapStyle,
        onMapStyleChange: handleMapStyleChange,
        onLocationChange: handleLocationChange
      }
    )
  ] });
};
export {
  AVAILABLE_FONTS,
  MAP_STYLES,
  Map as default
};
