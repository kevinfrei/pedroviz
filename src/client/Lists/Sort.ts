import { isUndefined } from 'node_modules/@freik/typechk/lib/esm';

import {
  chkHeadingVal,
  chkRef,
  chkValue,
  getInterpType,
} from '../../DataTypeChecks';
import {
  Curve,
  CurveRef,
  HeadingRef,
  HeadingVal,
  InterpRef,
  Pose,
  PoseRef,
  Ref,
  ValRef,
  Value,
} from '../../DataTypes';

function CheckRefs(ar: unknown, br: unknown): number {
  const a = chkRef(ar);
  const b = chkRef(br);
  if (a != b) {
    return a ? -1 : 1;
  }
  if (a && b) {
    return ar.ref.localeCompare(br.ref);
  }
  return Number.NaN;
}

export function ValueSorter(av: ValRef, bv: ValRef): number {
  const refRes = CheckRefs(av, bv);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return (av as Value).val - (bv as Value).val;
}

export function HeadingSorter(
  ah: HeadingRef | undefined,
  bh: HeadingRef | undefined,
): number {
  const ad = isUndefined(ah);
  const bd = isUndefined(bh);
  if (ad !== bd) {
    return ah ? -1 : 1;
  }
  if (ad) {
    return 0;
  }
  const refRes = CheckRefs(ah, bh);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return ValueSorter((ah as HeadingVal).angle, (bh as HeadingVal).angle);
}

export function PoseXSorter(ap: PoseRef, bp: PoseRef): number {
  const refRes = CheckRefs(ap, bp);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return ValueSorter((ap as Pose).X, (bp as Pose).X);
}

export function PoseYSorter(ap: PoseRef, bp: PoseRef): number {
  const refRes = CheckRefs(ap, bp);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return ValueSorter((ap as Pose).Y, (bp as Pose).Y);
}

export function PoseHeadingSorter(ap: PoseRef, bp: PoseRef): number {
  const refRes = CheckRefs(ap, bp);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return HeadingSorter((ap as Pose).heading, (bp as Pose).heading);
}

export function InterpSorter(ai: InterpRef, bi: InterpRef): number {
  const refRes = CheckRefs(ai, bi);
  if (!isNaN(refRes)) {
    return refRes;
  }
  return getInterpType(ai).localeCompare(getInterpType(bi));
}

export function CurveSorter(ac: CurveRef, bc: CurveRef): number {
  const refRes = CheckRefs(ac, bc);
  if (!isNaN(refRes)) {
    return refRes;
  }
  const a = ac as Curve;
  const b = bc as Curve;
  const maybe = a.points.length - b.points.length;
  if (maybe !== 0) {
    return maybe;
  }
  return InterpSorter(a.interpolation, b.interpolation);
}

export function CurveArraySorter(ac: CurveRef[], bc: CurveRef[]): number {
  return ac.length - bc.length;
}

export function MaybeInterpSorter(
  ai: InterpRef | undefined,
  bi: InterpRef | undefined,
): number {
  const au = isUndefined(ai);
  const bu = isUndefined(bi);
  if (au === bu) {
    return au ? 0 : InterpSorter(ai!, bi!);
  }
  return au ? -1 : 1;
}
