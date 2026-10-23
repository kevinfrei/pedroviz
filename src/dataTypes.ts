// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkRecordOf,
  isBoolean,
  isError,
  isNumber,
  isString,
  typecheck,
} from '@freik/typechk';

// Simple types (these live in the JSON file, too)

export type Ref = { ref: string };
export type Value = { val: number };
export type ValRef = Value | Ref;

export type HeadingVal = { angle: ValRef; inRadians: boolean };
// This is specifically only a ref to a *pose* not a value.
// For a ref to a value, you must use the HeadingVal type above.
export type HeadingRef = Ref | HeadingVal;

export type Pose = {
  X: ValRef;
  Y: ValRef;
  heading?: HeadingRef;
};
export type PoseRef = Pose | Ref;

export type InterpRef = Interpolator | Ref;
export type TangentInterp = { reversed: boolean };
export type FacePtInterp = { point: PoseRef };
export type ConstInterp = { heading: HeadingRef };
export type LinearInterp = {
  start: HeadingRef;
  end: HeadingRef;
  longWay: boolean;
};
export type InterpPiece = { until: ValRef; interpolator: InterpRef };
export type PieceWiseInterp = { pieces: InterpPiece[] };
export type Interpolator =
  ConstInterp | FacePtInterp | LinearInterp | PieceWiseInterp | TangentInterp;

export type Curve = { points: PoseRef[]; interpolation: InterpRef };
export type CurveRef = Curve | Ref;

export type Path = { curves: CurveRef[]; globalInterpolator?: InterpRef };

export type SymbolTable = {
  values: Map<string, ValRef>;
  poses: Map<string, PoseRef>;
  interpolations: Map<string, InterpRef>;
  curves: Map<string, CurveRef>;
  paths: Map<string, Path>;
};

const InterpNamesArray = [
  'Constant',
  'Facing',
  'Linear',
  'Tangent',
  'PieceWise',
  'Reference',
] as const;
export type InterpNames = (typeof InterpNamesArray)[number];

export type NamedValues = {
  values: Record<string, ValRef>;
  poses: Record<string, PoseRef>;
  interpolations: Record<string, InterpRef>;
  curves: Record<string, CurveRef>;
  paths: Record<string, Path>;
};

export function getInterpType(interp: InterpRef): InterpNames {
  if (chkRef(interp)) {
    return 'Reference';
  }
  if (chkConstInterp(interp)) {
    return 'Constant';
  }
  if (chkFacePtInterp(interp)) {
    return 'Facing';
  }
  if (chkLinearInterp(interp)) {
    return 'Linear';
  }
  if (chkTangentInterp(interp)) {
    return 'Tangent';
  }
  if (chkPieceWiseInterp(interp)) {
    return 'PieceWise';
  }
  console.log(interp);
  throw new Error(`Invalid Interpolator: ${interp}`);
}

// Type checkers:
export const chkErr = isError;
export const chkRef = chkObjectOfExactType<Ref>({ ref: isString });
export const chkValue = chkObjectOfExactType<Value>({ val: isNumber });
export const chkValRef = chkAnyOf(chkRef, chkValue);
export const chkHeadingVal = chkObjectOfExactType<HeadingVal>({
  angle: chkValRef,
  inRadians: isBoolean,
});
export const chkHeadingRef: typecheck<HeadingRef> = (
  obj: unknown,
): obj is HeadingRef => {
  return chkAnyOf(chkPoseRef, chkHeadingVal)(obj);
};
export const chkPose = chkObjectOfExactType<Pose>(
  {
    X: chkValRef,
    Y: chkValRef,
  },
  {
    heading: chkAnyOf(chkHeadingRef, chkHeadingVal),
  },
);
export const chkPoseRef = chkAnyOf(chkRef, chkPose);
export const chkConstInterp = chkObjectOfExactType<ConstInterp>({
  heading: chkHeadingRef,
});
export const chkFacePtInterp = chkObjectOfExactType<FacePtInterp>({
  point: chkPoseRef,
});
export const chkLinearInterp = chkObjectOfExactType<LinearInterp>({
  start: chkHeadingRef,
  end: chkHeadingRef,
  longWay: isBoolean,
});
export const chkTangentInterp = chkObjectOfExactType<TangentInterp>({
  reversed: isBoolean,
});
// have to declare a function, because recursion and delayed binding and stuff
const chkInterpPiece: typecheck<InterpPiece> = (obj: unknown) =>
  chkObjectOfExactType<InterpPiece>({
    until: chkValRef,
    interpolator: chkInterpRef,
  })(obj);
export const chkPieceWiseInterp = chkObjectOfExactType<PieceWiseInterp>({
  pieces: chkArrayOf(chkInterpPiece),
});
const chkInterpolator: typecheck<Interpolator> = chkAnyOf(
  chkConstInterp,
  chkFacePtInterp,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkTangentInterp,
);
export const chkInterpRef: typecheck<InterpRef> = (obj: unknown) =>
  chkAnyOf(chkRef, chkInterpolator)(obj);

const chkCurve = chkObjectOfExactType<Curve>({
  points: chkArrayOf(chkPoseRef),
  interpolation: chkInterpRef,
});
export const chkCurveRef = chkAnyOf(chkRef, chkCurve);

export const chkPath = chkObjectOfExactType<Path>(
  { curves: chkArrayOf(chkCurveRef) },
  { globalInterpolator: chkInterpRef },
);

export const chkNamedValues = chkObjectOfExactType<NamedValues>({
  values: chkRecordOf(isString, chkValRef),
  poses: chkRecordOf(isString, chkPoseRef),
  curves: chkRecordOf(isString, chkCurveRef),
  interpolations: chkRecordOf(isString, chkInterpRef),
  paths: chkRecordOf(isString, chkPath),
});

/*
const chkSymbolTable = chkObjectOfExactType<SymbolTable>({
  values: chkMapOf(isString, chkValRef),
  poses: chkMapOf(isString, chkPoseRef),
  curves: chkMapOf(isString, chkCurveRef),
  interpolations: chkMapOf(isString, chkInterpRef),
  paths: chkMapOf(isString, chkPath),
});
*/
