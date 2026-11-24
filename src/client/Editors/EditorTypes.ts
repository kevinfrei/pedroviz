// SPDX-License-Identifier: AGPL-3.0-or-later

import { chkObjectOfExactType, isBoolean, typecheck } from '@freik/typechk';

import { chkRef, chkValue, HeadingRef, Ref, Value } from '../../dataTypes';

export type HeadingType = 'pose' | 'ref' | 'val' | 'none';
export const hrIsPose: typecheck<Ref> = chkRef;
export const hrIsVal = chkObjectOfExactType<{
  angle: Value;
  inRadians: boolean;
}>({
  angle: chkValue,
  inRadians: isBoolean,
});
export const hrIsRef = chkObjectOfExactType<{ angle: Ref; inRadians: boolean }>(
  {
    angle: chkRef,
    inRadians: isBoolean,
  },
);
export function getHeadingType(item: HeadingRef | null): HeadingType {
  if (hrIsPose(item)) {
    return 'pose';
  } else if (hrIsRef(item)) {
    return 'ref';
  } else if (hrIsVal(item)) {
    return 'val';
  } else {
    return 'none';
  }
}
