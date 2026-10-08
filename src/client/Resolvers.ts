// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ResolvedCurve,
  ResolvedInterpolator,
  ResolvedPose,
  ResolvedValue,
} from 'src/client/ResolvedTypes';
import { hasField, isDefined, isError, MakeError } from '@freik/typechk';

import {
  chkConstInterp,
  chkFacePtInterp,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkRef,
  chkTangentInterp,
} from '../DataTypeChecks';
import {
  CurveRef,
  InterpPiece,
  InterpRef,
  Path,
  PoseRef,
  SymbolTable,
  ValRef,
} from '../DataTypes';

// Resolvers:

export function resolveValRef(
  valRef: ValRef,
  dict: SymbolTable,
  seen = new Set<string>(),
): ResolvedValue {
  if (chkRef(valRef)) {
    if (seen.has(valRef.ref)) {
      return MakeError(`Circular value reference detected :${valRef.ref}`);
    }
    seen.add(valRef.ref);
    const lkup = dict.values.get(valRef.ref);
    return isDefined(lkup)
      ? resolveValRef(lkup, dict, seen)
      : MakeError(`Missing value reference: ${valRef.ref}`);
  }
  // The ValRef's val is the resolved value
  return valRef.val;
}

// This always resolved to degrees
export function resolvePoseRef(
  poseRef: PoseRef,
  dict: SymbolTable,
  seen = new Set<string>(),
): ResolvedPose {
  if (chkRef(poseRef)) {
    if (seen.has(poseRef.ref)) {
      return MakeError(`Circular pose reference detected :${poseRef.ref}`);
    }
    seen.add(poseRef.ref);
    const lkup = dict.poses.get(poseRef.ref);
    return isDefined(lkup)
      ? resolvePoseRef(lkup, dict, seen)
      : MakeError(`Missing pose reference: ${poseRef.ref}`);
  }
  // Resolve the PoseRef's individual components:
  const X = resolveValRef(poseRef.X, dict);
  const Y = resolveValRef(poseRef.Y, dict);
  if (hasField(poseRef, 'Heading')) {
    let Heading = resolveValRef(poseRef.Heading!, dict);
    if (isError(Heading)) {
      return { X, Y, Heading };
    }
    if (poseRef.inRadians) {
      Heading = (180 * Heading) / Math.PI;
    }
    return { X, Y, Heading };
  } else {
    return { X, Y };
  }
}

/*export*/ function resolveInterpRef(
  interpRef: InterpRef,
  dict: SymbolTable,
  seen = new Set<string>(),
): ResolvedInterpolator {
  if (chkRef(interpRef)) {
    if (seen.has(interpRef.ref)) {
      return MakeError(
        `Circular interpolator reference detected :${interpRef.ref}`,
      );
    }
    seen.add(interpRef.ref);
    const lkup = dict.interpolations.get(interpRef.ref);
    return isDefined(lkup)
      ? resolveInterpRef(lkup, dict, seen)
      : MakeError(`Missing interpolator reference: ${interpRef.ref}`);
  }
  // Resolve the Interpolator, since it's not a reference
  if (chkTangentInterp(interpRef)) {
    // Tangent's are dumb: it's literally just
    // "yup, it's tangent: Maybe it's reversed?"
    return interpRef;
  } else if (chkConstInterp(interpRef)) {
    return { heading: resolveValRef(interpRef.heading, dict) };
  } else if (chkFacePtInterp(interpRef)) {
    return { point: resolvePoseRef(interpRef.point, dict) };
  } else if (chkLinearInterp(interpRef)) {
    return {
      startHeading: resolveValRef(interpRef.startHeading, dict),
      endHeading: resolveValRef(interpRef.endHeading, dict),
      longWay: interpRef.longWay,
    };
  } else if (chkPieceWiseInterp(interpRef)) {
    return {
      pieces: interpRef.pieces.map((piece: InterpPiece) => ({
        until: resolveValRef(piece.until, dict),
        interpolater: resolveInterpRef(piece.interpolator, dict, seen),
      })),
    };
  }
  return MakeError(`Unknown interpolator type ${interpRef}`);
}

/*export*/ function resolveCurveRef(
  curveRef: CurveRef,
  dict: SymbolTable,
  seen = new Set<string>(),
): ResolvedCurve {
  if (chkRef(curveRef)) {
    if (seen.has(curveRef.ref)) {
      return MakeError(`Circular curve reference detected :${curveRef.ref}`);
    }
    seen.add(curveRef.ref);
    const lkup = dict.curves.get(curveRef.ref);
    return isDefined(lkup)
      ? resolveCurveRef(lkup, dict, seen)
      : MakeError(`Missing interpolator reference: ${curveRef.ref}`);
  }
  return {
    points: curveRef.points.map((poseRef) => resolvePoseRef(poseRef, dict)),
    interpolation: resolveInterpRef(curveRef.interpolation, dict),
  };
}

/*export*/ function resolvePath(path: Path, dict: SymbolTable) {
  const curves = path.curves.map((curveRef) => resolveCurveRef(curveRef, dict));
  if (hasField(path, 'globalInterpolator')) {
    return {
      curves,
      globalInterpolator: resolveInterpRef(path.globalInterpolator!, dict),
    };
  }
  return { curves };
}
