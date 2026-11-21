// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  CurveRef,
  InterpRef,
  mkConstInterp,
  mkCurve,
  mkFacingInterp,
  mkHeading,
  mkLinearInterp,
  mkPath,
  mkPathInterp,
  mkPiece,
  mkPiecewise,
  mkPose,
  mkRef,
  mkTangentInterp,
  mkValue,
  Path,
  PoseRef,
  SymbolTable,
  ValRef,
} from '../dataTypes';
import { RecordToMap } from '../helpers';

export const Strings = {
  select_a_bot: 'Select bot',
  save_json: 'Save JSON',
  upload_to_bot: 'Upload',
  rescan_source: 'Rescan',
  Viz4Pedro: 'Viz 4 Pedro',
  Reset: 'Reset',
  pedropaths_json_file_name: 'PedroPaths.json',
};

export const EMPTY_SYMBOL_TABLE: SymbolTable = {
  values: new Map(),
  poses: new Map(),
  interpolations: new Map(),
  curves: new Map(),
  paths: new Map(),
};

export const SAMPLE_AUTONOMOUS_PRESET: SymbolTable = {
  values: RecordToMap<ValRef>({
    startX: mkValue(15),
    startY: mkValue(12),
    startHeading: mkValue(0.0),
    targetX: mkValue(44.5),
    targetY: mkValue(33.2),
    targetHeading: mkValue(90.0),
    midpointX: mkValue(71.5),
    midpointY: mkValue(71.5),
    cutoffStep: mkValue(0.5),
    valRef: mkRef('targetHeading'),
  }),
  poses: RecordToMap<PoseRef>({
    startPose: mkPose(
      mkRef('startX'),
      mkRef('startY'),
      mkHeading(mkRef('startHeading')),
    ),
    waypointPose: mkPose(
      mkRef('midpointX'),
      mkRef('midpointY'),
      mkHeading(mkValue(135)),
    ),
    targetPose: mkPose(
      mkRef('targetX'),
      mkRef('targetY'),
      mkRef('waypointPose'),
    ),
    refPose: mkRef('waypointPose'),
  }),
  interpolations: RecordToMap<InterpRef>({
    tangentInterp: mkTangentInterp(),
    linearHeadingInterp: mkLinearInterp(
      mkRef('startPose'),
      mkRef('waypointPose'),
    ),
    constantInterp: mkConstInterp(mkRef('startPose')),
    faceTargetInterp: mkFacingInterp(mkRef('targetPose')),
    piecewiseInterp: mkPiecewise(
      mkPiece(mkRef('cutoffStep'), mkRef('tangentInterp')),
      mkPiece(mkValue(1.0), mkRef('linearHeadingInterp')),
    ),
  }),
  curves: RecordToMap<CurveRef>({
    approachCurve: mkCurve(
      mkTangentInterp(),
      mkRef('startPose'),
      mkPose(mkValue(15), mkValue(33)),
      mkRef('waypointPose'),
    ),
    finishCurve: mkCurve(
      mkRef('linearHeadingInterp'),
      mkRef('waypointPose'),
      mkRef('targetPose'),
    ),
  }),
  paths: RecordToMap<Path>({
    mainAutoPath: mkPathInterp(
      mkRef('tangentInterp'),
      mkRef('approachCurve'),
      mkRef('finishCurve'),
    ),
    secondAutoPath: mkPath(
      mkCurve(
        mkConstInterp(mkHeading(mkValue(135))),
        mkRef('approachCurve'),
        mkRef('finishCurve'),
      ),
    ),
  }),
};
