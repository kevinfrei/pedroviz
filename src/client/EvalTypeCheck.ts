// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  isBoolean,
  isNumber,
  typecheck,
} from '@freik/typechk';

import {
  EvalCurve,
  EvalCurveDetail,
  EvalInterpConstant,
  EvalInterpFacing,
  EvalInterpLinear,
  EvalInterpolator,
  EvalInterpPiece,
  EvalInterpPiecewise,
  EvalInterpSimple,
  EvalInterpTangent,
  EvalPose,
  Point,
} from './EvalTypes';

const chkPoint = chkObjectOfExactType<Point>(
  { x: isNumber, y: isNumber },
  { h: isNumber },
);
export const chkEvalPose = chkObjectOfExactType<EvalPose>(
  { x: isNumber, y: isNumber },
  { radians: isNumber },
);
const chkEvalCurveDetail = chkObjectOfExactType<EvalCurveDetail>({
  length: isNumber,
  points: chkArrayOf(chkPoint),
  controlPoints: chkArrayOf(chkEvalPose),
});
export const chkEvalInterpTangent = chkObjectOfExactType<EvalInterpTangent>({
  reversed: isBoolean,
});
export const chkEvalInterpConstant = chkObjectOfExactType<EvalInterpConstant>({
  radians: isNumber,
});
export const chkEvalInterpLinear = chkObjectOfExactType<EvalInterpLinear>({
  startRadians: isNumber,
  endRadians: isNumber,
  longWay: isBoolean,
});
export const chkEvalInterpFacing = chkObjectOfExactType<EvalInterpFacing>({
  x: isNumber,
  y: isNumber,
});
export const chkEvalInterpSimple: typecheck<EvalInterpSimple> = chkAnyOf(
  chkEvalInterpConstant,
  chkEvalInterpFacing,
  chkEvalInterpLinear,
  chkEvalInterpTangent,
);
const chkEvalInterpPiece = chkObjectOfExactType<EvalInterpPiece>({
  until: isNumber,
  interp: chkEvalInterpSimple,
});
const chkEvalInterpPiecewise: typecheck<EvalInterpPiecewise> =
  chkArrayOf(chkEvalInterpPiece);
export const chkEvalInterpolator: typecheck<EvalInterpolator> = chkAnyOf(
  chkEvalInterpSimple,
  chkEvalInterpPiecewise,
);
export const chkEvalCurve = chkObjectOfExactType<EvalCurve>({
  points: chkEvalCurveDetail,
  interpolator: chkEvalInterpolator,
});
