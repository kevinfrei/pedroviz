import { atom } from 'jotai';

import { isDefined } from 'node_modules/@freik/typechk/lib/esm';

import { NamedValues, SymbolTable } from './dto_schema';

export const SAMPLE_AUTONOMOUS_PRESET: NamedValues = {
  values: {
    startX: { val: -5.0 },
    startY: { val: -2.0 },
    startHeading: { val: 0.0 },
    targetX: { val: 4.5 },
    targetY: { val: 3.2 },
    targetHeading: { val: 90.0 },
    midpointX: { val: 0.0 },
    midpointY: { val: 1.5 },
    cutoffStep: { val: 0.5 },
  },
  poses: {
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
  },
  interpolations: {
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
  },
  curves: {
    approachCurve: {
      points: [{ ref: 'startPose' }, { ref: 'waypointPose' }],
      interpolation: { ref: 'tangentInterp' },
    },
    finishCurve: {
      points: [{ ref: 'waypointPose' }, { ref: 'targetPose' }],
      interpolation: { ref: 'linearHeadingInterp' },
    },
  },
  paths: {
    mainAutoPath: {
      curves: [{ ref: 'approachCurve' }, { ref: 'finishCurve' }],
      globalInterpolator: { ref: 'tangentInterp' },
    },
  },
};

export const EMPTY_WORKSPACE_PRESET: NamedValues = {
  values: {},
  poses: {},
  interpolations: {},
  curves: {},
  paths: {},
};

export const themeAtom = atom<'dark' | 'light'>('dark');
export const toastAtom = atom<string | null>(null);
// TODO: NamedValues shouldn't be used in the front end. Just use the SymbolTable.
// NamedValues is just for serialization and deserialization.
export const namedValuesAtom = atom<NamedValues>(SAMPLE_AUTONOMOUS_PRESET);
export function RecordToMap<T>(
  obj: Record<string, T> | undefined,
): Map<string, T> {
  return new Map<string, T>(
    isDefined(obj)
      ? Object.keys(obj).map((val: string): [string, T] => [val, obj[val]!])
      : [],
  );
}
export function MapToRecord<T>(
  obj: Map<string, T> | undefined,
): Record<string, T> | undefined {
  return isDefined(obj) && obj.size > 0
    ? Object.fromEntries(obj.entries())
    : undefined;
}
export const symbolTableAtom = atom((get) => {
  const obj = get(namedValuesAtom);
  const res: SymbolTable = {
    values: RecordToMap(obj.values),
    poses: RecordToMap(obj.poses),
    interpolations: RecordToMap(obj.interpolations),
    curves: RecordToMap(obj.curves),
    paths: RecordToMap(obj.paths),
  };
  return res;
});
export const activeTabAtom = atom('values');
export const selectedKeyAtom = atom({ store: 'values', key: 'startX' });
export const searchFilterAtom = atom('');
export const visualizerSettingsAtom = atom({
  showGrid: true,
  showLabels: true,
  showVectors: true,
  gridStep: 1.0,
  pathResolution: 30,
});
