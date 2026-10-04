import { isDefined } from 'node_modules/@freik/typechk/lib/esm';

import { SymbolTable } from '../dto_schema';

export const SAMPLE_AUTONOMOUS_PRESET: SymbolTable = {
  values: RecordToMap({
    startX: { val: -5.0 },
    startY: { val: -2.0 },
    startHeading: { val: 0.0 },
    targetX: { val: 4.5 },
    targetY: { val: 3.2 },
    targetHeading: { val: 90.0 },
    midpointX: { val: 0.0 },
    midpointY: { val: 1.5 },
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
      Heading: { val: 45.0 },
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
/*
export const EMPTY_WORKSPACE_PRESET: SymbolTable = {
  values: new Map(),
  poses: new Map(),
  interpolations: new Map(),
  curves: new Map(),
  paths: new Map(),
};
*/
function RecordToMap<T>(obj: Record<string, T> | undefined): Map<string, T> {
  return new Map<string, T>(
    isDefined(obj)
      ? Object.keys(obj).map((val: string): [string, T] => [val, obj[val]!])
      : [],
  );
}
/*
function MapToRecord<T>(
  obj: Map<string, T> | undefined,
): Record<string, T> | undefined {
  return isDefined(obj) && obj.size > 0
    ? Object.fromEntries(obj.entries())
    : undefined;
}
*/
