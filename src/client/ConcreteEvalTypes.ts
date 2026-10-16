// SPDX-License-Identifier: AGPL-3.0-or-later

import { ErrorOr } from 'node_modules/@freik/typechk/lib/esm';

export type Point = { x: number; y: number; h?: number };
export type CurveDetail = { length: number; points: Point[] };

export const ConcreteHeadingType = Object.freeze({
  Tangent: 'T',
  Constant: 'C',
  Linear: 'I',
  Point: 'P',
  Reverse: 'R',
  Piecewise: 'L',
} as const);
export type ConcreteHeadingType =
  (typeof ConcreteHeadingType)[keyof typeof ConcreteHeadingType];

export type ConcreteTangentHeading = {
  type: typeof ConcreteHeadingType.Tangent;
  reversed: boolean;
};
export type ConcreteConstantHeading = {
  type: typeof ConcreteHeadingType.Constant;
  heading: number;
};
export type ConcreteLinearHeading = {
  type: typeof ConcreteHeadingType.Linear;
  long: boolean;
  headings: [number, number];
};
export type ConcretePointHeading = {
  type: typeof ConcreteHeadingType.Point;
  heading: Point;
};
export type ConcretePiece = {
  start: number;
  end: number;
  heading: ConcreteSimpleHeading;
};
export type ConcretePiecewiseHeading = {
  type: typeof ConcreteHeadingType.Piecewise;
  pieces: ConcretePiece[];
};
export type ConcreteSimpleHeading =
  | ConcreteTangentHeading
  | ConcreteConstantHeading
  | ConcreteLinearHeading
  | ConcretePointHeading;
export type ConcreteHeading = ConcreteSimpleHeading | ConcretePiecewiseHeading;

export type EvalPose = { x: number; y: number; radians?: number };
export type EvalInterpTangent = { reversed: boolean };
export type EvalInterpConstant = { radians: number };
export type EvalInterpLinear = {
  startRadians: number;
  endRadians: number;
  longWay: boolean;
};
export type EvalInterpFacing = Point;
export type EvalInterpSimple =
  EvalInterpConstant | EvalInterpFacing | EvalInterpLinear | EvalInterpTangent;
export type EvalInterpPiece = { until: number; interp: EvalInterpSimple };
export type EvalInterpPiecewise = EvalInterpPiece[];
export type EvalInterpolator = EvalInterpSimple | EvalInterpPiecewise;
export type EvalCurve = { points: CurveDetail; interpolator: EvalInterpolator };
export type EvalPath = {
  curves: EvalCurve[];
  globalInterpolator?: EvalInterpolator;
};

export type EvalSymbols = {
  values: Map<string, ErrorOr<number>>;
  poses: Map<string, ErrorOr<EvalPose>>;
  interpolators: Map<string, ErrorOr<EvalInterpolator>>;
  curves: Map<string, ErrorOr<EvalCurve>>;
  paths: Map<string, ErrorOr<EvalPath>>;
};

export type CorrectSymbols = {
  values: Map<string, number>;
  poses: Map<string, EvalPose>;
  interpolators: Map<string, EvalInterpolator>;
  curves: Map<string, EvalCurve>;
  paths: Map<string, EvalPath>;
};
