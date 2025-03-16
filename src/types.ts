export interface PosterSize {
  name: string;
  width: number;
  height: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface LayerStyle {
  fontSize: number;
  color: string;
  rotation: number;
  fontFamily: string;
  isEmoji?: boolean;
  isSvg?: boolean;
}

export interface TextStyle extends LayerStyle {}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
  fontFamily: string;
  isEmoji?: boolean;
  isSvg?: boolean;
  svgPath?: string;
}

export interface MapStyle {
  name: string;
  url: string;
  attribution: string;
}

// Available SVG icons
export const SVG_ICONS = {
  mapPin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  babyBottle: "M11.69 4.5c.36-.36.58-.86.58-1.41C12.27 1.95 11.31 1 10.16 1H8.84C7.69 1 6.73 1.95 6.73 3.09c0 .55.22 1.05.58 1.41L6.27 6.34C5.52 7.09 5 8.1 5 9.21V20c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V9.21c0-1.11-.52-2.12-1.27-2.87L16.69 4.5c.36-.36.58-.86.58-1.41C17.27 1.95 16.31 1 15.16 1h-1.32c-1.15 0-2.11.95-2.11 2.09 0 .55.22 1.05.58 1.41l-1.62 1.84z",
  graduation: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
}; 