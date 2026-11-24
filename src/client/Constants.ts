// SPDX-License-Identifier: AGPL-3.0-or-later

import { SymbolTable } from '../dataTypes';

export const Strings = {
  select_a_bot: 'Select bot',
  save_json: 'Save JSON',
  upload_to_bot: 'Upload',
  delete_upload: 'Remove upload',
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
