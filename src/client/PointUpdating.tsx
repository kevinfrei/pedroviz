import { isUndefined } from '@freik/typechk';

import {
  chkRef,
  Curve,
  mkCurve,
  mkPath,
  mkPathInterp,
  mkPose,
  mkValue,
  Path,
  Pose,
  SymbolTable,
} from '../dataTypes';
import { MovablePoint, Point, ValueLocator } from './EvalTypes';
import { calcDist } from './ui-tools/ui-helpers';

// This stuff is described in './CanvasDescriptors.md'

function updateValue(st: SymbolTable, name: string, val: number): SymbolTable {
  const values = new Map(st.values);
  values.set(name, mkValue(val));
  return { ...st, values };
}

function newPose(descr: string, pose: Pose, val: number): Pose {
  switch (descr) {
    case 'x':
      return mkPose(mkValue(val), pose.Y, pose.heading);
    case 'y':
      return mkPose(pose.X, mkValue(val), pose.heading);
    default:
      console.error('Descriptor', descr, 'appears malformed');
  }
  return pose;
}

function updatePose(
  st: SymbolTable,
  name: string,
  descr: string,
  val: number,
): SymbolTable {
  const pose = st.poses.get(name);
  if (isUndefined(pose) || chkRef(pose)) {
    console.error('Unable to find selected pose value', name);
    return st;
  }
  const poses = new Map(st.poses);
  poses.set(name, newPose(descr, pose, val));
  return { ...st, poses };
}

function newCurve(descr: string, curve: Curve, val: number): Curve {
  const pointNum = Number.parseInt(descr.substring(0, descr.length - 1));
  if (Number.isNaN(pointNum) || curve.points.length <= pointNum) {
    console.error(
      'Curve point',
      descr,
      'invalid',
      pointNum,
      'length',
      curve.points.length,
    );
    return curve;
  }
  const resCurve: Curve = mkCurve(curve.interpolation, ...curve.points);
  if (chkRef(curve.points[pointNum])) {
    console.error('Curve point', pointNum, 'is a Ref. This should not happen');
    return curve;
  }
  resCurve.points[pointNum] = newPose(
    descr[descr.length - 1]!,
    curve.points[pointNum]!,
    val,
  );
  return resCurve;
}

function updateCurve(
  st: SymbolTable,
  name: string,
  descr: string, // The leading 'c' is removed...
  val: number,
): SymbolTable {
  const curve = st.curves.get(name);
  if (isUndefined(curve) || chkRef(curve)) {
    console.error('Unable to find selected *defined* curve', name);
    return st;
  }
  const curves = new Map(st.curves);
  curves.set(name, newCurve(descr, curve, val));
  return { ...st, curves };
}

function updatePath(
  st: SymbolTable,
  name: string,
  descr: string, // The leading 'P' is removed...
  val: number,
): SymbolTable {
  const path = st.paths.get(name);
  if (isUndefined(path)) {
    console.error('Unable to find selected path', name);
    return st;
  }
  const curveNum = Number.parseInt(descr);
  if (
    Number.isNaN(curveNum) ||
    path.curves.length <= curveNum ||
    chkRef(path.curves[curveNum])
  ) {
    console.error(
      'Path curve',
      descr,
      'invalid',
      curveNum,
      'count',
      path.curves.length,
    );
    return st;
  }
  const paths = new Map(st.paths);
  const newPath: Path = path.globalInterpolator
    ? mkPathInterp(path.globalInterpolator, ...path.curves)
    : mkPath(...path.curves);
  newPath.curves[curveNum] = newCurve(
    descr.substring(descr.indexOf('c') + 1), // Trim off the # and the 'c'
    path.curves[curveNum]!,
    val,
  );
  paths.set(name, newPath);
  return { ...st, paths };
}

function Assign(
  st: SymbolTable,
  [, name, descr]: ValueLocator,
  num: number,
): SymbolTable {
  // console.log('Name', name, 'Descriptor', descr, 'Cur', curVal, 'New', num);
  // Parse the descr and then set the right value in a copy of the symbol table :/
  if (descr.length < 1) {
    return st;
  }
  switch (descr[0]) {
    case 'v':
      // It's a value: Just update the value itself
      return updateValue(st, name, num);
    case 'x':
    case 'y':
      // It's a point; Get the point, update the coordinate
      return updatePose(st, name, descr, num);
    case 'c':
      // It's a curve in-place value:
      return updateCurve(st, name, descr.substring(1), num);
    case 'P':
      // A path with an in-place curve:
      return updatePath(st, name, descr.substring(1), num);
    default:
      console.error('unsupported descriptor', descr);
  }
  return st;
}

export function SetMovablePoint(
  st: SymbolTable,
  sst: (s: SymbolTable) => void,
  m: MovablePoint,
  dest: Point,
): void {
  if (calcDist(dest, m) < 0.01) {
    return;
  }
  // Interpret the descriptor to assign the value. For Both.
  // (Functional programming is sometimes weird...)
  sst(Assign(Assign(st, m.x, dest.x), m.y, dest.y));
}
