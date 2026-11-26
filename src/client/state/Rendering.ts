// SPDX-License-Identifier: AGPL-3.0-or-later

import { atom } from 'jotai';

import { isError } from '@freik/typechk';

import {
  EvalCurveDetail,
  EvalSymbols,
  MovablePoint,
  ShallowCurve,
  ShallowEvalSymbols,
  ShallowPath,
  ShallowPose,
} from '../EvalTypes';
import {
  EvaluateSymbols,
  notError,
  notNull,
  notRef,
  ShallowEvaluateSymbols,
} from '../Evaluation';
import { lastSelectedCurveOrPathAtom, symbolTableAtom } from './SymbolTable';

export const evaluatedSymbolsAtom = atom<Promise<EvalSymbols>>(async (get) =>
  EvaluateSymbols(await get(symbolTableAtom)),
);

export const shallowSymbolsAtom = atom<Promise<ShallowEvalSymbols>>(
  async (get) => ShallowEvaluateSymbols(await get(symbolTableAtom)),
);

export const movablePointsAtom = atom<Promise<MovablePoint[]>>(async (get) => {
  const shallow = await get(shallowSymbolsAtom);
  // const movablePoints: MovablePoint[] = [];
  const shallowPoseToMovable = (sPoseRef: ShallowPose): MovablePoint | null => {
    // The x and y values are either ValueLocators (used directly in the movable points)
    // or they are references to Values, which we also need to register here
    const x = shallow.getValue(sPoseRef.x);
    const y = shallow.getValue(sPoseRef.y);
    if (isError(x) || isError(y)) {
      return null;
    }
    return { x, y };
  };
  const getMovables = (curve: ShallowCurve) =>
    curve.points.filter(notRef).flatMap(shallowPoseToMovable).filter(notNull);
  const pathPoints = shallow.paths
    .values()
    .filter(notError)
    .flatMap((curveDescriptor: ShallowPath) =>
      curveDescriptor.curves.filter(notRef).flatMap(getMovables),
    );
  const curvePoints = shallow.curves
    .values()
    .filter(notError)
    .filter(notRef)
    .flatMap(getMovables);
  const posePoints = shallow.poses
    .values()
    .filter(notError)
    .filter(notRef)
    .map(shallowPoseToMovable)
    .filter(notNull);
  return [...pathPoints, ...curvePoints, ...posePoints];
});
export type AnimationPath = {
  curves: EvalCurveDetail[];
};

export const animationPathAtom = atom(
  async (get): Promise<AnimationPath | undefined> => {
    const evaluated = await get(evaluatedSymbolsAtom);
    const pathOrCurve = get(lastSelectedCurveOrPathAtom) || '';
    const selectedPath = evaluated.paths.get(pathOrCurve);
    if (!selectedPath) {
      const selCurve = evaluated.curves.get(pathOrCurve);
      if (!selCurve || isError(selCurve)) {
        return;
      } else {
        return { curves: [selCurve.points] };
      }
    } else if (!isError(selectedPath)) {
      return {
        curves: selectedPath.curves.map((ec) => ec.points),
      };
    }
  },
);
