// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  ErrorOr,
  isError,
  isString,
  typecheck,
} from '@freik/typechk';

import { chkNamedValues, NamedValues } from './dataTypes';
import { Nominal } from './typeHelpers';

export type Team = Nominal<string, 'Team'>;
export type TeamList = Team[];
export type PathsFile = ErrorOr<NamedValues>;

/*export*/ const chkTeam: typecheck<Team> = isString;
export const chkTeamList = chkArrayOf(chkTeam);
export const chkPathsFile = chkAnyOf(isError, chkNamedValues);
