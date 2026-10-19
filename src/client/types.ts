// SPDX-License-Identifier: AGPL-3.0-or-later

import { CSSProperties } from 'react';

export const CtrlPtStyles = Object.freeze({
  Circle: 'o',
  Triangle: 't',
  Square: 's',
  Crosshair: '+',
  X: 'x',
  None: 'z',
} as const);
export type CtrlPtStyles = (typeof CtrlPtStyles)[keyof typeof CtrlPtStyles];

export type ControlPointStyle = {
  Thickness: number;
  Size: number;
  Style: CtrlPtStyles;
};

export type HeadingStyle = {
  Length: number;
  Thickness: number;
  ArrowAngle: number;
  ArrowPercent: number;
};

export type CurveStyle = {
  Thickness: number;
  ShowPoints: boolean;
  ControlPoint: ControlPointStyle;
};

export type PathStyle = {
  HeadingCount: number;
  Heading: HeadingStyle;
  Curves: CurveStyle;
};

export const BotShapes = Object.freeze({
  Trapezoid: 'Trapezoid',
  Triangle: 'Triangle',
  Ellipse: 'Ellipse',
  Rectangle: 'Rectangle',
} as const);
export type BotShapes = (typeof BotShapes)[keyof typeof BotShapes];

export type BotDrawStyle = {
  Shape: BotShapes;
  Width: number;
  Depth: number;
  Color?: string;
};

export type DisplayOptions = {
  GranularSettings: boolean;
  FieldVisibility: number;
  CoordinateVisibility: number;
  UseExternalField: boolean;
  DarkMode: boolean;
  Poses: {
    Points: ControlPointStyle;
    Headings: HeadingStyle;
  };
  Curves: CurveStyle;
  Paths: PathStyle;
  BotDrawing: BotDrawStyle;
};

export type ResponsiveAnchor = {
  x: 'left' | 'center' | 'right';
  y: 'top' | 'middle' | 'bottom';
};

export type Offset = { left: number; top: number };

/*export*/ type CanvasRenderFunc = (
  ctx: CanvasRenderingContext2D,
  devicePixelRatio: number,
) => void;

export type ResponsiveSquareCanvasProps = {
  anchor?: ResponsiveAnchor;
  style?: CSSProperties;
  className?: string;
  render: CanvasRenderFunc;
  animate?: CanvasRenderFunc;
};
