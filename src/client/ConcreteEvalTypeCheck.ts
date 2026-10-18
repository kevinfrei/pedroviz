// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkTupleOf,
  isBoolean,
  isNumber,
  typecheck,
} from '@freik/typechk';

import {
  ConcreteConstantHeading,
  ConcreteHeadingType,
  ConcreteLinearHeading,
  ConcretePiecewiseHeading,
  ConcretePointHeading,
  ConcreteSimpleHeading,
  ConcreteTangentHeading,
  CurveDetail,
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
  EvalPath,
  EvalPose,
  Point,
} from './ConcreteEvalTypes';

const chkPoint = chkObjectOfExactType<Point>(
  { x: isNumber, y: isNumber },
  { h: isNumber },
);
const chkCurveDetail = chkObjectOfExactType<CurveDetail>({
  length: isNumber,
  points: chkArrayOf(chkPoint),
});
const chkConcreteTangentHeading = chkObjectOfExactType<ConcreteTangentHeading>({
  type: (t: unknown): t is typeof ConcreteHeadingType.Tangent =>
    t === ConcreteHeadingType.Tangent,
  reversed: isBoolean,
});

const chkConcreteConstantHeading =
  chkObjectOfExactType<ConcreteConstantHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Constant =>
      t === ConcreteHeadingType.Constant,
    heading: isNumber,
  });

/*export*/ const chkConcreteLinearHeading =
  chkObjectOfExactType<ConcreteLinearHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Linear =>
      t === ConcreteHeadingType.Linear,
    headings: chkTupleOf(isNumber, isNumber),
    long: isBoolean,
  });

const chkConcretePointHeading = chkObjectOfExactType<ConcretePointHeading>({
  type: (t: unknown): t is typeof ConcreteHeadingType.Point =>
    t === ConcreteHeadingType.Point,
  heading: chkPoint,
});

export const chkConcreteSimpleHeading: typecheck<ConcreteSimpleHeading> =
  chkAnyOf(
    chkConcreteTangentHeading,
    chkConcreteConstantHeading,
    chkConcreteLinearHeading,
    chkConcretePointHeading,
  );

const chkConcretePiece = chkObjectOfExactType({
  start: isNumber,
  end: isNumber,
  heading: chkConcreteSimpleHeading,
});

const chkConcretePieceWiseHeading =
  chkObjectOfExactType<ConcretePiecewiseHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Piecewise =>
      t === ConcreteHeadingType.Piecewise,
    pieces: chkArrayOf(chkConcretePiece),
  });

const chkConcreteHeading = chkAnyOf(
  chkConcretePieceWiseHeading,
  chkConcreteSimpleHeading,
);

export const chkEvalPose = chkObjectOfExactType<EvalPose>(
  { x: isNumber, y: isNumber },
  { radians: isNumber },
);
/*export*/ const chkEvalCurveDetail = chkObjectOfExactType<EvalCurveDetail>({
  length: isNumber,
  points: chkArrayOf(chkPoint),
  controlPoints: chkArrayOf(chkEvalPose),
});
export const chkEvalInterpTangent = chkObjectOfExactType<EvalInterpTangent>({
  reversed: isBoolean,
});
/*export*/ const chkEvalInterpConstant =
  chkObjectOfExactType<EvalInterpConstant>({
    radians: isNumber,
  });
/*export*/ const chkEvalInterpLinear = chkObjectOfExactType<EvalInterpLinear>({
  startRadians: isNumber,
  endRadians: isNumber,
  longWay: isBoolean,
});
/*export*/ const chkEvalInterpFacing = chkObjectOfExactType<EvalInterpFacing>({
  x: isNumber,
  y: isNumber,
});
export const chkEvalInterpSimple: typecheck<EvalInterpSimple> = chkAnyOf(
  chkEvalInterpConstant,
  chkEvalInterpFacing,
  chkEvalInterpLinear,
  chkEvalInterpTangent,
);
/*export*/ const chkEvalInterpPiece = chkObjectOfExactType<EvalInterpPiece>({
  until: isNumber,
  interp: chkEvalInterpSimple,
});
/*export*/ const chkEvalInterpPiecewise: typecheck<EvalInterpPiecewise> =
  chkArrayOf(chkEvalInterpPiece);
export const chkEvalInterpolator: typecheck<EvalInterpolator> = chkAnyOf(
  chkEvalInterpSimple,
  chkEvalInterpPiecewise,
);
export const chkEvalCurve = chkObjectOfExactType<EvalCurve>({
  points: chkEvalCurveDetail,
  interpolator: chkEvalInterpolator,
});
/*export*/ const chkEvalPath = chkObjectOfExactType<EvalPath>(
  {
    curves: chkArrayOf(chkEvalCurve),
  },
  {
    globalInterpolator: chkEvalInterpolator,
  },
);
