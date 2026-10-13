import { isUndefined } from 'node_modules/@freik/typechk/lib/esm';

import {
  chkHeadingVal,
  chkRef,
  chkValue,
  getInterpType,
} from '../../DataTypeChecks';
import {
  HeadingRef,
  InterpRef,
  Pose,
  PoseRef,
  Ref,
  ValRef,
  Value,
} from '../../DataTypes';

export function ValueSorter(av: ValRef, bv: ValRef): number {
  const avVal = chkValue(av);
  const bvVal = chkValue(bv);
  if (avVal !== bvVal) {
    return avVal ? -1 : 1;
  }
  if (avVal) {
    return av.val - (bv as Value).val;
  }
  return av.ref.localeCompare((bv as Ref).ref);
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
  if (chkHeadingVal(ah) && chkHeadingVal(bh)) {
    return ValueSorter(ah.angle, bh.angle);
  } else {
    return chkRef(ah) ? -1 : 1;
  }
}

export function PoseSorter(ap: PoseRef, bp: PoseRef): number {
  const aRef = chkRef(ap);
  const bRef = chkRef(bp);
  if (aRef !== bRef) {
    return aRef ? -1 : 1;
  }
  if (aRef) {
    return ap.ref.localeCompare((bp as Ref).ref);
  }
  // They're both Pose's, not PoseRef's:
  return ValueSorter(ap.X, (bp as Pose).X);
}

export function InterpSorter(ai: InterpRef, bi: InterpRef): number {
  const aRef = chkRef(ai);
  const bRef = chkRef(bi);
  if (aRef !== bRef) {
    return aRef ? -1 : 1;
  }
  if (aRef) {
    return ai.ref.localeCompare((bi as Ref).ref);
  }
  const at = getInterpType(ai);
  const bt = getInterpType(bi);
  return at.localeCompare(bt);
}
