// SPDX-License-Identifier: AGPL-3.0-or-later

import { ErrorOr } from '@freik/typechk';

import { RefOr } from '../dataTypes';
import { Nominal } from '../typeHelpers';

export type Point = { x: number; y: number; h?: number };
export type CurveDetail = { length: number; points: Point[] };

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
type Name = Nominal<string, 'Name'>;
type Descriptor = Nominal<string, 'Descriptor'>;
export type ValueLocator = [number, Name, Descriptor];
export type ShallowValRef = RefOr<ValueLocator>;
export type MovablePoint = { x: ValueLocator; y: ValueLocator };
export type ShallowPose = {
  x: ShallowValRef;
  y: ShallowValRef;
  heading?: ShallowHeadingRef;
};
export type ShallowPoseRef = RefOr<ShallowPose>;
type ShallowHeading = { angle: ShallowValRef; inRadians: boolean };
export type ShallowHeadingRef = RefOr<ShallowHeading>; // PoseRef or ShallowHeading...
export type ShallowPiece = {
  until: ShallowValRef;
  heading: RefOr<ShallowInterpolator>;
};
type ShallowInterpolator =
  | { reversed: boolean }
  | {
      heading: ShallowHeadingRef;
    }
  | {
      long: boolean;
      headings: [ShallowHeadingRef, ShallowHeadingRef];
    }
  | { facing: ShallowPoseRef }
  | { pieces: ShallowPiece[] };
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
