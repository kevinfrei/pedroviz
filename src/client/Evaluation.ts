// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ErrorOr,
  hasFieldOf,
  isError,
  isNumber,
  isUndefined,
  MakeError,
  typecheck,
} from '@freik/typechk';

import {
  chkConstInterp,
  chkFacePtInterp,
  chkHeadingRef,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkRef,
  chkTangentInterp,
} from '../DataTypeChecks';
import {
  CurveRef,
  HeadingRef,
  InterpRef,
  Path,
  PoseRef,
  Ref,
  SymbolTable,
  ValRef,
} from '../DataTypes';
import {
  chkEvalCurve,
  chkEvalInterpSimple,
  chkEvalInterpTangent,
  chkEvalPose,
} from './ConcreteEvalTypeCheck';
import {
  CorrectSymbols,
  EvalCurve,
  EvalInterpolator,
  EvalPath,
  EvalPose,
  EvalSymbols,
} from './ConcreteEvalTypes';
import { getCurveDetail, ptDistance } from './DrawingHelpers';

export function EvaluateSymbols(symbolTable: SymbolTable): EvalSymbols {
  const evalSyms: EvalSymbols = {
    values: new Map(),
    poses: new Map(),
    interpolators: new Map(),
    curves: new Map(),
    paths: new Map(),
  };

  function recurseRef<FROM, TO>(
    name: string,
    ref: Ref,
    evalMap: Map<string, ErrorOr<TO>>,
    symTable: Map<string, FROM>,
    chkType: typecheck<TO>,
    evalFn: (ref: FROM, seen: Set<string>) => ErrorOr<TO>,
    seen: Set<string>,
  ): ErrorOr<TO> {
    // First, check for a circular reference:
    if (seen.has(ref.ref)) {
      return MakeError(`Circular ${name} reference detected: ${ref.ref}`);
    }
    // For a reference, check if it's already been evaluated:
    const ev = evalMap.get(ref.ref);
    if (isError(ev)) {
      return MakeError(ev, `Error for ${name} reference ${ref.ref}`);
    } else if (chkType(ev)) {
      return ev;
    } else if (!isUndefined(ev)) {
      return MakeError(`Unexpected error for ${name} reference ${ref.ref}`);
    }
    // Hasn't been evaluated: Evaluate it.
    const vr = symTable.get(ref.ref);
    if (isUndefined(vr)) {
      return MakeError(`Undefined ${name} reference ${ref.ref}`);
    }
    // Add it to the 'seen' set and recurse.
    const newSeen = new Set(seen);
    newSeen.add(ref.ref);
    return evalFn(vr, newSeen);
  }

  function evaluateValue(
    val: ValRef,
    seen = new Set<string>(),
  ): ErrorOr<number> {
    if (chkRef(val)) {
      return recurseRef(
        'value',
        val,
        evalSyms.values,
        symbolTable.values,
        isNumber,
        evaluateValue,
        seen,
      );
    }
    // If it's just a value, return the value...
    return val.val;
  }

  function evaluateHeading(
    headingRef: HeadingRef,
    seen = new Set<string>(),
  ): ErrorOr<number> {
    if (chkRef(headingRef)) {
      // If it's a reference, it must be a *pose* reference, because a simple
      // value reference should be a ValRef on the angle with an 'inRadians' bool
      const pv = evaluatePose(headingRef, seen);
      if (isError(pv)) {
        return MakeError(pv, 'Evaluating the pose reference from a heading');
      }
      if (!hasFieldOf(pv, 'radians', isNumber)) {
        return MakeError(
          `Pose referenced by heading ${headingRef.ref} is missing a heading!`,
        );
      }
      return pv.radians;
    }
    const angle = evaluateValue(headingRef.angle, seen);
    if (isError(angle)) {
      return MakeError(angle, 'Error from the angle of a heading');
    }
    return headingRef.inRadians ? angle : (angle * Math.PI) / 180.0;
  }

  function evaluatePose(
    pose: PoseRef,
    seen = new Set<string>(),
  ): ErrorOr<EvalPose> {
    if (chkRef(pose)) {
      return recurseRef(
        'pose',
        pose,
        evalSyms.poses,
        symbolTable.poses,
        chkEvalPose,
        evaluatePose,
        seen,
      );
    }
    // It's a simple pose: Evaluate it's constinuent parts:
    const x = evaluateValue(pose.X);
    if (isError(x)) {
      return MakeError(x, 'Issue while evaluating the X position of a Pose');
    }
    const y = evaluateValue(pose.Y);
    if (isError(y)) {
      return MakeError(y, 'Issue while evaluating the Y position of a Pose');
    }
    if (hasFieldOf(pose, 'heading', chkHeadingRef)) {
      const radians = evaluateHeading(pose.heading, seen);
      if (isError(radians)) {
        return MakeError(
          radians,
          'Issue while evaluating the heading of a Pose',
        );
      }
      return { x, y, radians };
    } else {
      return { x, y };
    }
  }

  function evaluateInterp(
    interp: InterpRef,
    seen = new Set<string>(),
  ): ErrorOr<EvalInterpolator> {
    if (chkRef(interp)) {
      return recurseRef(
        'interpolator',
        interp,
        evalSyms.interpolators,
        symbolTable.interpolations,
        chkEvalInterpTangent,
        evaluateInterp,
        seen,
      );
    }
    // Non-ref interpolators:
    if (chkTangentInterp(interp)) {
      return { reversed: interp.reversed };
    } else if (chkConstInterp(interp)) {
      const eh = evaluateHeading(interp.heading);
      if (isError(eh)) {
        return MakeError(
          eh,
          'Error while evaluating the head of a constant interpolator',
        );
      }
      return { radians: eh };
    } else if (chkFacePtInterp(interp)) {
      const ep = evaluatePose(interp.point);
      if (isError(ep)) {
        return MakeError(
          ep,
          'Issue while evaluating the pose of a FacingPoint interpolator',
        );
      }
      return { x: ep.x, y: ep.y };
    } else if (chkLinearInterp(interp)) {
      const startRadians = evaluateHeading(interp.start);
      if (isError(startRadians)) {
        return MakeError(
          startRadians,
          'Issue while evaluating the start of a liner interpolator',
        );
      }
      const endRadians = evaluateHeading(interp.end);
      if (isError(endRadians)) {
        return MakeError(
          endRadians,
          'Issue while evaluating the end of a liner interpolator',
        );
      }
      return { startRadians, endRadians, longWay: interp.longWay };
    } else if (chkPieceWiseInterp(interp)) {
      const res = [];
      for (const piece of interp.pieces) {
        const epu = evaluateValue(piece.until);
        if (isError(epu)) {
          return MakeError(
            epu,
            "Issue evaluating the 'until' of a PieceWise interpolator",
          );
        }
        const epp = evaluateInterp(piece.interpolator, seen);
        if (isError(epp)) {
          return MakeError(
            epp,
            'Issue evaluating a piece of a PieceWise interpolator',
          );
        }
        if (chkEvalInterpSimple(epp)) {
          res.push({ until: epu, interp: epp });
        } else {
          return MakeError(
            'Non-simple interpolator in a piece-wise interpolator list',
          );
        }
      }
      return res;
    }
    return MakeError('Catastrophic error in evaluateInterps');
  }

  function evaluateCurve(
    curve: CurveRef,
    seen = new Set<string>(),
  ): ErrorOr<EvalCurve> {
    if (chkRef(curve)) {
      return recurseRef(
        'curve',
        curve,
        evalSyms.curves,
        symbolTable.curves,
        chkEvalCurve,
        evaluateCurve,
        seen,
      );
    }
    const interpolator = evaluateInterp(curve.interpolation);
    if (isError(interpolator)) {
      return MakeError(interpolator, "Issue with a curve's interpolator");
    }
    const points: EvalPose[] = [];
    for (const p of curve.points) {
      const ep = evaluatePose(p);
      if (isError(ep)) {
        return MakeError(ep, "Issue with one of a curve's points");
      }
      points.push(ep);
    }
    // Okay now let's turn all the bezier curve paths into actual beziers:
    if (points.length === 2) {
      return {
        interpolator,
        points: { length: ptDistance(points[0]!, points[1]!), points },
      };
    } else if (points.length < 2) {
      return MakeError('Curve with fewer than 2 points!');
    } else {
      return { interpolator, points: getCurveDetail(points) };
    }
  }

  function evaluatePath(path: Path): ErrorOr<EvalPath> {
    const curves: EvalCurve[] = [];
    for (const c of path.curves) {
      const ec = evaluateCurve(c);
      if (isError(ec)) {
        return MakeError(ec, "Issue with one of a path's curves");
      }
      curves.push(ec);
    }
    if (path.globalInterpolator) {
      const globalInterpolator = evaluateInterp(path.globalInterpolator);
      if (isError(globalInterpolator)) {
        return MakeError(
          globalInterpolator,
          "Issue with a path's global interpolator",
        );
      }
      return { curves, globalInterpolator };
    }
    return { curves };
  }

  symbolTable.values.forEach((valRef, name) => {
    evalSyms.values.set(name, evaluateValue(valRef));
  });

  symbolTable.poses.forEach((poseRef, name) => {
    evalSyms.poses.set(name, evaluatePose(poseRef));
  });

  symbolTable.interpolations.forEach((ir, name) => {
    evalSyms.interpolators.set(name, evaluateInterp(ir));
  });

  symbolTable.curves.forEach((cr, name) => {
    evalSyms.curves.set(name, evaluateCurve(cr));
  });

  symbolTable.paths.forEach((p, name) => {
    evalSyms.paths.set(name, evaluatePath(p));
  });

  // TODO: Report errors!
  return evalSyms;
}

function notError<T>(n_err: [string, ErrorOr<T>]): n_err is [string, T] {
  return !isError(n_err[1]);
}

export function CalculateItems(evalSyms: EvalSymbols): CorrectSymbols {
  const correctSymbols: CorrectSymbols = {
    values: new Map(evalSyms.values.entries().filter(notError)),
    poses: new Map(evalSyms.poses.entries().filter(notError)),
    interpolators: new Map(evalSyms.interpolators.entries().filter(notError)),
    curves: new Map(evalSyms.curves.entries().filter(notError)),
    paths: new Map(evalSyms.paths.entries().filter(notError)),
  };
  return correctSymbols;
}
