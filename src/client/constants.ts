// SPDX-License-Identifier: AGPL-3.0-or-later

import { isDefined } from '@freik/typechk';

import { SymbolTable } from '../DataTypes';

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
  values: RecordToMap({
    startX: { val: 15.0 },
    startY: { val: 12.0 },
    startHeading: { val: 0.0 },
    targetX: { val: 44.5 },
    targetY: { val: 33.2 },
    targetHeading: { val: 90.0 },
    midpointX: { val: 71.5 },
    midpointY: { val: 71.5 },
    cutoffStep: { val: 0.5 },
  }),
  poses: RecordToMap({
    startPose: {
      X: { ref: 'startX' },
      Y: { ref: 'startY' },
      Heading: { ref: 'startHeading' },
      inRadians: false,
    },
    waypointPose: {
      X: { ref: 'midpointX' },
      Y: { ref: 'midpointY' },
      Heading: { val: 135.0 },
      inRadians: false,
    },
    targetPose: {
      X: { ref: 'targetX' },
      Y: { ref: 'targetY' },
      Heading: { ref: 'targetHeading' },
      inRadians: false,
    },
  }),
  interpolations: RecordToMap({
    tangentInterp: { reversed: false },
    linearHeadingInterp: {
      startHeading: { ref: 'startHeading' },
      endHeading: { ref: 'targetHeading' },
      longWay: false,
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
  curves: RecordToMap({
    approachCurve: {
      points: [{ ref: 'startPose' }, { ref: 'waypointPose' }],
      interpolation: { ref: 'tangentInterp' },
    },
    finishCurve: {
      points: [{ ref: 'waypointPose' }, { ref: 'targetPose' }],
      interpolation: { ref: 'linearHeadingInterp' },
    },
  }),
  paths: RecordToMap({
    mainAutoPath: {
      curves: [{ ref: 'approachCurve' }, { ref: 'finishCurve' }],
      globalInterpolator: { ref: 'tangentInterp' },
    },
  }),
};
