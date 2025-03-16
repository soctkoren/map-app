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
  mapPin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
}; 