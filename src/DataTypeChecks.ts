// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  isBoolean,
  isError,
  isNumber,
  isString,
  typecheck,
} from '@freik/typechk';

import {
  ConstInterp,
  Curve,
  FacePtInterp,
  InterpNames,
  Interpolator,
  InterpPiece,
  InterpRef,
  LinearInterp,
  Path,
  PieceWiseInterp,
  Pose,
  Ref,
  TangentInterp,
  Value,
} from './DataTypes';

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
  throw new Error('Invalid Interpolator...');
}

// Type checkers:
export const chkErr = isError;
export const chkRef = chkObjectOfExactType<Ref>({ ref: isString });
export const chkValue = chkObjectOfExactType<Value>({ val: isNumber });
export const chkValRef = chkAnyOf(chkRef, chkValue);
const chkPose = chkObjectOfExactType<Pose>(
  {
    X: chkValRef,
    Y: chkValRef,
  },
  {
    Heading: chkValRef,
    inRadians: isBoolean,
  },
);
export const chkPoseRef = chkAnyOf(chkRef, chkPose);
export const chkConstInterp = chkObjectOfExactType<ConstInterp>({
  heading: chkValRef,
});
export const chkFacePtInterp = chkObjectOfExactType<FacePtInterp>({
  point: chkPoseRef,
});
export const chkLinearInterp = chkObjectOfExactType<LinearInterp>({
  startHeading: chkValRef,
  endHeading: chkValRef,
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
const chkInterpRef: typecheck<InterpRef> = (obj: unknown) =>
  chkAnyOf(chkRef, chkInterpolator)(obj);

const chkCurve = chkObjectOfExactType<Curve>({
  points: chkArrayOf(chkPoseRef),
  interpolation: chkInterpRef,
});
const chkCurveRef = chkAnyOf(chkRef, chkCurve);

const chkPath = chkObjectOfExactType<Path>(
  { curves: chkArrayOf(chkCurveRef) },
  { globalInterpolator: chkInterpRef },
);

/*
const chkNamedValues = chkObjectOfExactType<NamedValues>({
  values: chkArrayOf(chkValRef),
  poses: chkArrayOf(chkPoseRef),
  curves: chkArrayOf(chkCurveRef),
  interpolations: chkArrayOf(chkInterpRef),
  paths: chkArrayOf(chkPath),
});

const chkSymbolTable = chkObjectOfExactType<SymbolTable>({
  values: chkMapOf(isString, chkValRef),
  poses: chkMapOf(isString, chkPoseRef),
  curves: chkMapOf(isString, chkCurveRef),
  interpolations: chkMapOf(isString, chkInterpRef),
  paths: chkMapOf(isString, chkPath),
});
*/
export function NewMapAdd<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  const newMap = new Map(map);
  newMap.set(key, value);
  return newMap;
}

export function NewMapDelete<K, V>(
  map: Map<K, V>,
  key: K,
): Map<K, V> | undefined {
  if (map.has(key)) {
    const newMap = new Map(map);
    newMap.delete(key);
    return newMap;
  }
  return undefined;
}

export function NewMapRename<K, V>(
  map: Map<K, V>,
  oldKey: K,
  newKey: K,
): Map<K, V> | undefined {
  if (oldKey === newKey) {
    return undefined;
  }
  const value = map.get(oldKey);
  if (value === undefined) {
    return undefined;
  }
  const newMap = new Map(map);
  newMap.delete(oldKey);
  newMap.set(newKey, value);
  return newMap;
}

export function NewMapUpdate<K, V>(map: Map<K, V>, key: K, val: V): Map<K, V> {
  const newMap = new Map(map);
  newMap.set(key, val);
  return newMap;
}
