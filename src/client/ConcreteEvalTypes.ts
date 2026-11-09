// SPDX-License-Identifier: AGPL-3.0-or-later

import { RefOr } from 'src/dataTypes';
import { Nominal } from 'src/typeHelpers';
import { ErrorOr } from '@freik/typechk';

export type Point = { x: number; y: number; h?: number };
export type CurveDetail = { length: number; points: Point[] };

export const ConcreteHeadingType = Object.freeze({
  Tangent: 'T',
  Constant: 'C',
  Linear: 'I',
  Point: 'P',
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
type ConcretePiece = {
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
export type EvalCurveDetail = {
  length: number;
  points: Point[];
  controlPoints: EvalPose[];
};
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
export type EvalCurve = {
  points: EvalCurveDetail;
  interpolator: EvalInterpolator;
};
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

export type Name = Nominal<string, 'Name'>;
export type Descriptor = Nominal<string, 'Descriptor'>;
export type ValueLocator = [number, Name, Descriptor];
export type ShallowValRef = RefOr<ValueLocator>;
export type MovablePoint = { x: ValueLocator; y: ValueLocator };
export type ShallowPose = {
  x: ShallowValRef;
  y: ShallowValRef;
  heading?: ShallowHeadingRef;
};
export type ShallowPoseRef = RefOr<ShallowPose>;
export type ShallowHeading = { angle: ShallowValRef; inRadians: boolean };
export type ShallowHeadingRef = RefOr<ShallowHeading>; // PoseRef or ShallowHeading...
export type ShallowPiece = {
  until: ShallowValRef;
  heading: RefOr<ShallowInterpolator>;
};
export type ShallowInterpolator =
  | { type: typeof ConcreteHeadingType.Tangent; reversed: boolean }
  | {
      type: typeof ConcreteHeadingType.Constant;
      heading: ShallowHeadingRef;
    }
  | {
      type: typeof ConcreteHeadingType.Linear;
      long: boolean;
      headings: [ShallowHeadingRef, ShallowHeadingRef];
    }
  | { type: typeof ConcreteHeadingType.Point; heading: ShallowPoseRef }
  | { type: typeof ConcreteHeadingType.Piecewise; pieces: ShallowPiece[] };
export type ShallowInterpolatorRef = RefOr<ShallowInterpolator>;
export type ShallowCurve = {
  points: ShallowPoseRef[];
  interpolator: ShallowInterpolatorRef;
};
export type ShallowCurveRef = RefOr<ShallowCurve>;
export type ShallowPath = {
  curves: ShallowCurveRef[];
  globalInterpolator?: ShallowInterpolatorRef;
};

export type ShallowEvalSymbols = {
  values: Map<string, ErrorOr<ShallowValRef>>;
  getValue: (svalRef: ShallowValRef) => ErrorOr<ValueLocator>;
  poses: Map<string, ErrorOr<ShallowPoseRef>>;
  interpolators: Map<string, ErrorOr<ShallowInterpolatorRef>>;
  curves: Map<string, ErrorOr<ShallowCurveRef>>;
  paths: Map<string, ErrorOr<ShallowPath>>;
};

export type FullSymbolTable = {
  shallow: ShallowEvalSymbols;
  evaluated: EvalSymbols;
  correct: CorrectSymbols;
};
