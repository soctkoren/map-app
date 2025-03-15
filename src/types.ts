export interface PosterSize {
  name: string;
  width: number;
  height: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface TextStyle {
  fontSize: number;
  color: string;
  rotation: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
} 