// SPDX-License-Identifier: AGPL-3.0-or-later

import { SymbolTable } from '../dataTypes';

export const Strings = {
  select_a_bot: 'Select bot',
  save_json: 'Save JSON',
  upload_to_bot: 'Upload',
  delete_upload: 'Kill upload',
  rescan_source: 'Rescan',
  Viz4Pedro: 'Viz 4 Pedro',
  Reset: 'Reset',
  pedropaths_json_file_name: 'PedroPaths.json',
  // Editors stuff:
  Values: 'Values',
  Poses: 'Poses',
  Interpolations: 'Interpolations',
  Curves: 'Lines & Curves',
  Paths: 'Paths',
  Raw_JSON: 'Raw JSON',
  CurveDef: 'Curve Definition',
  InterpDef: 'Interpolator Definition',
  PathDef: 'Path Curves/Lines',
  DelCurveSegment: 'Remove Curve Segment',
  OptInterpOverride: 'Path-wide Interpolator (Optional)',
  AddCurve: 'Add Curve',
  Segment: 'Segment',
  PoseDef: 'Pose Coordinates & Heading',
  ValueDefinition: 'Value or Reference',
  // Data table stuff:
  Name: 'Name',
  Type_Ref: 'Type/Ref',
  X_Ref: 'X/Ref',
  Y: 'Y',
  Heading: 'Heading',
  PointSuffix: ' points, ',
  Val_Ref: 'Value / Reference',
  CurveCount: 'Curve Count',
  WholePathInterp: 'Whole Path Interpolator',
  // Localization functions (I'm *sure* this is as complicated
  // as localization gets. Definitely...):
  Pluralize: (nm: string) => nm + 's',
  NotFound: (item: string) => `No ${item} found.`,
  Search: (item: string) => `Search ${item}`,
};

export const EMPTY_SYMBOL_TABLE: SymbolTable = {
  values: new Map(),
  poses: new Map(),
  interpolations: new Map(),
  curves: new Map(),
  paths: new Map(),
};
