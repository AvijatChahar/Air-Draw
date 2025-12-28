
export enum GestureType {
  NONE = 'NONE',
  DRAW = 'DRAW',
  HOVER = 'HOVER',
  ERASE = 'ERASE'
}

export enum PathType {
  DRAW = 'DRAW',
  ERASE = 'ERASE'
}

export interface DrawingConfig {
  color: string;
  brushSize: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  size: number;
  type: PathType;
}
