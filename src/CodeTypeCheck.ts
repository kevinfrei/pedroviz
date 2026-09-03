// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkFieldOf,
  chkObjectOfExactType,
  isArrayOfString,
  isNumber,
  isRecordOf,
  isString,
  typecheck,
} from '@freik/typechk';

import {
  AnonymousBezier,
  AnonymousInterp,
  AnonymousPose,
  AnonymousValue,
  BezierName,
  BezierRef,
  BezierType,
  ClassContainer,
  DoubleValue,
  HeadingRef,
  InterpConstant,
  InterpLinear,
  InterpolationType,
  InterpPiece,
  InterpPiecewise,
  InterpPoint,
  InterpReversed,
  InterpReversible,
  InterpTangent,
  InterpTiming,
  IntValue,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  ParsedClass,
  PathChainHelper,
  PoseName,
  PoseRef,
  RadiansRef,
  ValueName,
  ValueRef,
} from './CodeTypes';

export const EmptyParsedClass: ParsedClass = {
  name: '',
  fullName: '',
  imports: [],
  container: { fileName: '' },
  children: {},
  values: [],
  poses: [],
  beziers: [],
  pathChains: [],
  pathChainHelpers: [],
  unmatchedFields: [],
};

export const isRef = isString;
export const isValueName: typecheck<ValueName> =
  isString as typecheck<ValueName>;
export const isIntValue = chkObjectOfExactType<IntValue>({ int: isNumber });
export const isDoubleValue = chkObjectOfExactType<DoubleValue>({
  double: isNumber,
});
export const isAnonymousValue: typecheck<AnonymousValue> = chkAnyOf(
  isIntValue,
  isDoubleValue,
);
export const isValueRef: typecheck<ValueRef> = chkAnyOf(
  isValueName,
  isAnonymousValue,
);
export const isRadiansRef = chkObjectOfExactType<RadiansRef>({
  radians: isValueRef,
});
/*export*/ const isNamedValue = chkObjectOfExactType<NamedValue>({
  name: isString,
  value: chkAnyOf(isValueRef, isRadiansRef),
});

/*export*/ const isHeadingRef: typecheck<HeadingRef> = chkAnyOf(
  isValueRef,
  isRadiansRef,
);

export const isPoseName: typecheck<PoseName> = isString as typecheck<PoseName>;
/*export*/ const isAnonymousPose = chkObjectOfExactType<AnonymousPose>(
  {
    x: isValueRef,
    y: isValueRef,
  },
  { heading: isHeadingRef },
);
/*export*/ const isNamedPose = chkObjectOfExactType<NamedPose>({
  name: isString,
  pose: isAnonymousPose,
});
/*export*/ const isPoseRef: typecheck<PoseRef> = chkAnyOf(
  isPoseName,
  isAnonymousPose,
);
function isBezierTypeName(t: unknown): t is BezierType {
  return t === BezierType.Line || t === BezierType.Curve;
}
/*export*/ const isBezierName: typecheck<BezierName> =
  isString as typecheck<BezierName>;
/*export*/ const isAnonymousBezier = chkObjectOfExactType<AnonymousBezier>({
  type: isBezierTypeName,
  points: chkArrayOf(isPoseRef),
});
/*export*/ const isNamedBezier = chkObjectOfExactType<NamedBezier>({
  name: isString,
  points: isAnonymousBezier,
});
/*export*/ const isBezierRef: typecheck<BezierRef> = chkAnyOf(
  isBezierName,
  isAnonymousBezier,
);
function isTangentInterpType(
  type: unknown,
): type is typeof InterpolationType.Tangent {
  return type === InterpolationType.Tangent;
}
function isConstantInterpType(
  type: unknown,
): type is typeof InterpolationType.Constant {
  return type === InterpolationType.Constant;
}
function isLinearInterpType(
  type: unknown,
): type is typeof InterpolationType.Linear {
  return type === InterpolationType.Linear;
}
function isPointInterpType(
  type: unknown,
): type is typeof InterpolationType.Point {
  return type === InterpolationType.Point;
}
function isReversedInterpType(
  type: unknown,
): type is typeof InterpolationType.Reversed {
  return type === InterpolationType.Reversed;
}
function isPiecewiseInterpType(
  type: unknown,
): type is typeof InterpolationType.Piecewise {
  return type === InterpolationType.Piecewise;
}

export const isTangentInterp = chkObjectOfExactType<InterpTangent>({
  type: isTangentInterpType,
});
export const isConstantInterp = chkObjectOfExactType<InterpConstant>({
  type: isConstantInterpType,
  heading: isHeadingRef,
});
export const isLinearInterp = chkObjectOfExactType<InterpLinear>({
  type: isLinearInterpType,
  start: isHeadingRef,
  end: isHeadingRef,
});
export const isPointInterp = chkObjectOfExactType<InterpPoint>({
  type: isPointInterpType,
  point: isPoseRef,
});
export const isReversibleInterp: typecheck<InterpReversible> = chkAnyOf(
  isTangentInterp,
  isConstantInterp,
  isLinearInterp,
  isPointInterp,
);
/*export*/ const isInterpTiming = chkObjectOfExactType<InterpTiming>({
  start: isValueRef,
  end: isValueRef,
});
export const isReversedInterp: typecheck<InterpReversed> =
  chkObjectOfExactType<InterpReversed>({
    type: isReversedInterpType,
    interp: isReversibleInterp,
  });
/*export*/ const isSimpleInterp = chkAnyOf(
  isReversibleInterp,
  isReversedInterp,
);
/*export*/ const isPiecewiseEntry: typecheck<InterpPiece> =
  chkObjectOfExactType<InterpPiece>({
    timing: isInterpTiming,
    heading: isSimpleInterp,
  });
export const isPiecewiseInterp = chkObjectOfExactType<InterpPiecewise>({
  type: isPiecewiseInterpType,
  pieces: chkArrayOf(isPiecewiseEntry),
});
/*export*/ const isAnonymousInterp: typecheck<AnonymousInterp> = (
  obj: unknown,
): obj is AnonymousInterp => {
  return chkAnyOf(
    isTangentInterp,
    isConstantInterp,
    isLinearInterp,
    isPointInterp,
    isPiecewiseInterp,
    isReversedInterp,
  )(obj);
};

/*export*/ const isNamedPathChain = chkObjectOfExactType<NamedPathChain>({
  name: isString,
  paths: chkArrayOf(isBezierRef),
  heading: isAnonymousInterp,
});

/*export*/ const isPathChainHelper = chkObjectOfExactType<PathChainHelper>({
  name: isString,
  staticType: isString,
});

/*export*/ const isClassContainer: typecheck<ClassContainer> = chkAnyOf(
  chkFieldOf('fileName', isString),
  chkFieldOf('className', isString),
);
export const chkParsedClass = chkObjectOfExactType<ParsedClass>({
  name: isString,
  fullName: isString,
  imports: isArrayOfString,
  container: isClassContainer,
  // Can't use chkRecordOf(isString, chkParsedClass) because we're defining
  // chkParsedClass, so the use won't occur until the 'children' field is
  // invoked. (Obscure value resolution rules FTW!)
  children: (val: unknown): val is Record<string, ParsedClass> =>
    isRecordOf(val, isString, chkParsedClass),
  values: chkArrayOf(isNamedValue),
  poses: chkArrayOf(isNamedPose),
  beziers: chkArrayOf(isNamedBezier),
  pathChains: chkArrayOf(isNamedPathChain),
  pathChainHelpers: chkArrayOf(isPathChainHelper),
  unmatchedFields: isArrayOfString,
});
/*export function chkParsedClass(val: unknown): val is ParsedClass {
  let res = hasStrField(val, 'name');
  res = res && hasStrField(val, 'fullName');
  res = res && hasFieldOf(val, 'container', isClassContainer);
  res = res && hasFieldOf(val, 'values', chkArrayOf(isNamedValue));
  res = res && hasFieldOf(val, 'poses', chkArrayOf(isNamedPose));
  res = res && hasFieldOf(val, 'beziers', chkArrayOf(isNamedBezier));
  res = res && hasFieldOf(val, 'pathChains', chkArrayOf(isNamedPathChain));
  res =
    res && hasFieldOf(val, 'pathChainHelpers', chkArrayOf(isPathChainHelper));
  res =
    res && hasFieldType(val, 'children', chkRecordOf(isString, chkParsedClass));
  res = res && hasFieldOf(val, 'unmatchedFields', isArrayOfString);
  return res;
}*/
