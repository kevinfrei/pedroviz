import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';

import { isDefined } from 'node_modules/@freik/typechk/lib/esm';

import {
  /*NamedValues,*/ CurveRef,
  InterpRef,
  Path,
  PoseRef,
  SymbolTable,
  ValRef,
} from '../dto_schema';

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

export const EMPTY_WORKSPACE_PRESET: SymbolTable = {
  values: new Map(),
  poses: new Map(),
  interpolations: new Map(),
  curves: new Map(),
  paths: new Map(),
};

export const themeAtom = atom<'dark' | 'light'>('dark');

// TODO: NamedValues shouldn't be used in the front end. Just use the SymbolTable.
// NamedValues is just for serialization and deserialization.
// const namedValuesAtom = atom<NamedValues>(SAMPLE_AUTONOMOUS_PRESET);
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
export const symbolTableAtom = atom<SymbolTable>(SAMPLE_AUTONOMOUS_PRESET);
export const symbolTableValuesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('values'),
);
export const symbolTablePosesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('poses'),
);
export const symbolTableInterpolationsAtom = focusAtom(
  symbolTableAtom,
  (optic) => optic.prop('interpolations'),
);
export const symbolTableCurvesAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('curves'),
);
export const symbolTablePathsAtom = focusAtom(symbolTableAtom, (optic) =>
  optic.prop('paths'),
);
type FieldOptions = 'values' | 'poses' | 'interpolations' | 'curves' | 'paths';
type SelectedKey = { store: FieldOptions; key: string };
export const activeTabAtom = atom('values');
export const selectedKeyAtom = atom<SelectedKey>({
  store: 'values',
  key: 'startX',
});
export const searchFilterAtom = atom('');
export const visualizerSettingsAtom = atom({
  showGrid: true,
  showLabels: true,
  showVectors: true,
  gridStep: 1.0,
  pathResolution: 30,
});
