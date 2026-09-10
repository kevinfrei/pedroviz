// SPDX-License-Identifier: AGPL-3.0-or-later

import { Nominal } from './TypeHelpers';

// Values
export type IntValue = { int: number };
export type DoubleValue = { double: number };
export type AnonymousValue = IntValue | DoubleValue;
export type ValueName = Nominal<string, 'Value'>;
export type NamedValue = { name: ValueName; value: ValueRef | RadiansRef };
export type ValueRef = AnonymousValue | ValueName;
export type RadiansRef = { radians: ValueRef };
export type HeadingRef = RadiansRef | ValueRef | PoseName;

// Poses
export type PoseName = Nominal<string, 'Pose'>;
export type AnonymousPose = { x: ValueRef; y: ValueRef; heading?: HeadingRef };
export type NamedPose = { name: PoseName; pose: PoseRef };
export type PoseRef = AnonymousPose | PoseName;

// Beziers
export type BezierName = Nominal<string, 'Bezier'>;
export const BezierType = Object.freeze({
  Line: 'line',
  Curve: 'curve',
} as const);
export type BezierType = (typeof BezierType)[keyof typeof BezierType];
export type AnonymousBezier = { type: BezierType; points: PoseRef[] };
export type NamedBezier = { name: BezierName; points: BezierRef };
export type BezierRef = AnonymousBezier | BezierName;

// Interpolation (path heading interpolators)
// NYI: Offset; works like reverse, but shifts the bot from the target by a
// fixed amount. Reverse is *mostly* "offset 180" (not for linear)
export type InterpTiming = { start: ValueRef; end: ValueRef };

export const InterpolationType = Object.freeze({
  Reversed: 'reversed',
  Tangent: 'tangent',
  Constant: 'constant',
  Linear: 'linear',
  Point: 'point',
  Piecewise: 'piecewise',
} as const);
export type InterpolationType =
  (typeof InterpolationType)[keyof typeof InterpolationType];
export type InterpReversed = {
  type: typeof InterpolationType.Reversed;
  interp: InterpReversible;
};
export type InterpTangent = { type: typeof InterpolationType.Tangent };
export type InterpConstant = {
  type: typeof InterpolationType.Constant;
  heading: HeadingRef;
};
export type InterpPoint = {
  type: typeof InterpolationType.Point;
  point: PoseRef;
};
export type InterpLinear = {
  type: typeof InterpolationType.Linear;
  start: HeadingRef;
  end: HeadingRef;
};
export type InterpReversible =
  InterpTangent | InterpConstant | InterpLinear | InterpPoint;
export type InterpSimple = InterpReversible | InterpReversed;
export type InterpPiece = { timing: InterpTiming; heading: InterpSimple };
export type InterpPiecewise = {
  type: typeof InterpolationType.Piecewise;
  pieces: InterpPiece[];
};
export type AnonymousInterp =
  | InterpTangent
  | InterpConstant
  | InterpLinear
  | InterpPoint
  | InterpPiecewise
  | InterpReversed;

// No such thing as an anonymous PathChain
export type PathChainName = Nominal<string, 'PathChain'>;

export type PathChainHelper = {
  name: string; // This should just be a simple variable name
  staticType: string; // This should be the package-local type being assigned
};

export type AnonymousPathChain = {
  paths: BezierRef[];
  heading: AnonymousInterp;
};

// Also: I'm not yet handling global vs. last heading modifiers
export type NamedPathChain = { name: PathChainName } & AnonymousPathChain;

export type ClassContainer = { fileName: string } | { className: string };

export type ParsedClass = {
  name: string;
  fullName: string;
  imports: string[];
  unmatchedFields: string[];
  parsingErrors: string[];
  container: ClassContainer;
  children: Record<string, ParsedClass>;
  values: NamedValue[];
  poses: NamedPose[];
  beziers: NamedBezier[];
  pathChains: NamedPathChain[];
  pathChainHelpers: PathChainHelper[];
};
