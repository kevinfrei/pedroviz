// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkEvalInterpConstant,
  chkEvalInterpFacing,
  chkEvalInterpLinear,
  chkEvalInterpSimple,
  chkEvalInterpTangent,
} from './EvalTypeCheck';
import {
  CurveDetail,
  EvalInterpolator,
  EvalInterpSimple,
  Point,
} from './EvalTypes';
import { bezierDerivative, bezierLength, deCasteljau } from './ui-tools/bezier';

export function rotPt(offs: Point): Point {
  const cos = Math.cos(offs.h!);
  const sin = Math.sin(offs.h!);
  const x = offs.x * cos - offs.y * sin;
  const y = offs.x * sin + offs.y * cos;
  return { x, y };
}

function getBezierPoints(curveControlPoints: Point[]): Point[] {
  const len = bezierLength(curveControlPoints);
  const pts: Point[] = [];
  for (let t = 0; t <= 1.0; t += 1 / len) {
    pts.push({ ...deCasteljau(curveControlPoints, t) });
  }
  return pts;
}

function calcCurve(controlPoints: Point[]): CurveDetail {
  if (controlPoints.length < 2) {
    return { length: 0, points: [] };
  }
  const points: Point[] = getBezierPoints(controlPoints);
  let length = 0;
  let lastPt = controlPoints[0]!;
  for (const pt of points) {
    length += ptDistance(lastPt, pt);
    lastPt = pt;
  }
  length += ptDistance(lastPt, controlPoints[controlPoints.length - 1]!);
  points.push(lastPt);
  return { length, points };
}

export function getCurveDetail(
  controlPoints: Point[],
  interp: EvalInterpolator,
): CurveDetail {
  const res = calcCurve(controlPoints);
  addHeadingToCurve(controlPoints, res, interp);
  return res;
}

// TODO: Figure out how Pedro decides what percentage of the curve applies to
// heading pieces and linear interpolations
function addHeadingToCurve(
  controlPoints: Point[],
  curve: CurveDetail,
  heading: EvalInterpolator,
): void {
  // for "n" points, I'm not drawing starting/ending headings, so I actually want to split
  // the length into count + 1 pieces, and find the point in between each piece
  let curDist = 0;
  if (curve.points.length < 3) {
    return;
  }
  let prevPoint: Point | null = null;
  for (let ptIndex = 0; ptIndex < curve.points.length; ptIndex++) {
    const cur = curve.points[ptIndex]!;
    curDist += prevPoint ? ptDistance(prevPoint, cur) : 0;
    addHeadingToPoint(
      controlPoints,
      prevPoint,
      cur,
      ptIndex + 1 < curve.points.length ? curve.points[ptIndex + 1]! : null,
      heading,
      curDist / curve.length,
    );
    // Keep going
    prevPoint = cur;
  }
}

function addHeadingToPoint(
  controlPoints: Point[],
  prev: Point | null,
  point: Point,
  next: Point | null,
  heading: EvalInterpolator,
  percent: number,
) {
  if (chkEvalInterpSimple(heading)) {
    point.h = calcSimpleHeading(
      controlPoints,
      heading,
      prev,
      point,
      next,
      percent,
    );
  } else {
    // Find the piece that this percentage is contained by
    // I think a linear search is fine, here..
    let last = 0;
    for (const piece of heading) {
      if (percent <= piece.until && percent >= last) {
        // Found the right piece, rescale percentage accordingly, and
        // get the heading for the piece
        point.h = calcSimpleHeading(
          controlPoints,
          piece.interp,
          prev,
          point,
          next,
          (percent - last) / (piece.until - last),
        );
      } else {
        last = piece.until;
      }
    }
  }
}

function ptDiff(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function ptDistance(a: Point, b: Point): number {
  const delta = ptDiff(a, b);
  return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
}

export function vector(radians: number, mag: number): Point {
  return { x: Math.cos(radians) * mag, y: Math.sin(radians) * mag };
}

function getAngle(pt: Point): number {
  return Math.atan2(pt.y, pt.x);
}

function calcSimpleHeading(
  controlPoints: Point[],
  heading: EvalInterpSimple,
  prev: Point | null,
  cur: Point,
  nxt: Point | null,
  percent: number,
): number {
  if (prev === null && nxt === null) {
    throw new Error("Can't have both prev and next points be null");
  }
  if (chkEvalInterpTangent(heading)) {
    if (!prev || !nxt) {
      return getAngle(bezierDerivative(controlPoints, percent));
    }
    return (getAngle(ptDiff(cur, prev)) + getAngle(ptDiff(nxt, cur))) / 2;
  } else if (chkEvalInterpConstant(heading)) {
    return heading.radians;
  } else if (chkEvalInterpLinear(heading)) {
    return linearRangeRadians(
      heading.startRadians,
      heading.endRadians,
      heading.longWay ? -percent : percent,
    );
  } else if (chkEvalInterpFacing(heading)) {
    return getAngle(ptDiff(heading, cur));
  }
  throw new Error('Invalid Simple Heading type');
}

export function CloseTo(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-8;
}

function normalizeRadian(a: number) {
  const result = a % (2 * Math.PI);
  return result >= 0 ? result : result + 2 * Math.PI;
}

function linearRangeRadians(
  start: number,
  end: number,
  percent: number,
): number {
  // First, push the values until they're all positive:
  const s = normalizeRadian(start);
  const e = normalizeRadian(end);
  let range = Math.abs(e - s);
  if (range > Math.PI && percent >= 0) {
    range = Math.PI * 2 - range;
  } else if (range < Math.PI && percent < 0) {
    range = Math.PI * 2 - range;
  }
  const flipped = !CloseTo(normalizeRadian(s + range), e);
  const target = normalizeRadian(
    s + range * (flipped ? -1 : 1) * Math.abs(percent),
  );
  return target;
}
