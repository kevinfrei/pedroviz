// SPDX-License-Identifier: AGPL-3.0-or-later

import { isDefined } from '@freik/typechk';

import {
  CurveRef,
  InterpRef,
  Path,
  Pose,
  PoseRef,
  SymbolTable,
  ValRef,
} from '../DataTypes';

export function RecordToMap<T>(
  obj: Record<string, T> | undefined,
): Map<string, T> {
  return new Map<string, T>(
    isDefined(obj)
      ? Object.keys(obj).map((val: string): [string, T] => [val, obj[val]!])
      : [],
  );
}

export const Strings = {
  select_a_bot: 'Select bot',
  select_a_file: 'Select file',
  select_a_class: 'Select class',
  rescan_source: 'Rescan',
  Viz4Pedro: 'Viz 4 Pedro',
  Reset: 'Reset',
};

export const SAMPLE_AUTONOMOUS_PRESET: SymbolTable = {
  values: RecordToMap<ValRef>({
    startX: { val: 15.0 },
    startY: { val: 12.0 },
    startHeading: { val: 0.0 },
    targetX: { val: 44.5 },
    targetY: { val: 33.2 },
    targetHeading: { val: 90.0 },
    midpointX: { val: 71.5 },
    midpointY: { val: 71.5 },
    cutoffStep: { val: 0.5 },
    valRef: { ref: 'targetHeading' },
  }),
  poses: RecordToMap<PoseRef>({
    startPose: {
      X: { ref: 'startX' },
      Y: { ref: 'startY' },
      heading: { angle: { ref: 'startHeading' }, inRadians: false },
    },
    waypointPose: {
      X: { ref: 'midpointX' },
      Y: { ref: 'midpointY' },
      heading: { angle: { val: 135.0 }, inRadians: false },
    },
    targetPose: {
      X: { ref: 'targetX' },
      Y: { ref: 'targetY' },
      heading: { ref: 'waypointPose' },
    },
    refPose: { ref: 'waypointPose' },
  }),
  interpolations: RecordToMap<InterpRef>({
    tangentInterp: { reversed: false },
    linearHeadingInterp: {
      start: { ref: 'startPose' },
      end: { ref: 'waypointPose' },
      longWay: false,
    },
    constantInterp: {
      heading: { ref: 'startPose' },
    },
    faceTargetInterp: {
      point: { ref: 'targetPose' },
    },
    piecewiseInterp: {
      pieces: [
        {
          until: { ref: 'cutoffStep' },
          interpolator: { ref: 'tangentInterp' },
        },
        {
          until: { val: 1.0 },
          interpolator: { ref: 'linearHeadingInterp' },
        },
      ],
    },
  }),
  curves: RecordToMap<CurveRef>({
    approachCurve: {
      points: [
        { ref: 'startPose' },
        { X: { val: 15 }, Y: { val: 33 } },
        { ref: 'waypointPose' },
      ],
      interpolation: { ref: 'tangentInterp' },
    },
    finishCurve: {
      points: [{ ref: 'waypointPose' }, { ref: 'targetPose' }],
      interpolation: { ref: 'linearHeadingInterp' },
    },
  }),
  paths: RecordToMap<Path>({
    mainAutoPath: {
      curves: [{ ref: 'approachCurve' }, { ref: 'finishCurve' }],
      globalInterpolator: { ref: 'tangentInterp' },
    },
  }),
};
