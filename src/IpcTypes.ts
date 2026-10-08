// SPDX-License-Identifier: AGPL-3.0-or-later

import { MultiMap } from '@freik/containers';
import { ErrorOr } from '@freik/typechk';

import { ParsedClass } from './CodeTypes';
import { TangentInterp, ValRef } from './DataTypes';
import { Nominal } from './TypeHelpers';

export type Team = Nominal<string, 'Team'>;
export type FilePath = Nominal<string, 'FilePath'>;
export type ClassName = Nominal<string, 'ClassName'>;

// A path key is a Path + * + seqnum
export type FilePathKey = Nominal<string, 'TeamPathKey'>;
export type TeamFilePaths = MultiMap<Team, FilePathKey>;

// A class key is a Class + * + seqnum
export type ClassKey = Nominal<string, 'ClassKey'>;
/*export*/ type PathClasses = MultiMap<FilePathKey, ClassKey>;

export type PathDatabase = {
  HasFieldImage: boolean;
  TeamPaths: TeamFilePaths;
  PathClasses: PathClasses;
  ParsedClasses: Map<ClassKey, ParsedClass>;
};

// Parsed Types for dealing with errors

export type ParsedValue = ErrorOr<ValRef>;
export type FullyParsedPose = {
  X: ParsedValue;
  Y: ParsedValue;
  Heading?: ParsedValue;
};
export type ParsedPose = ErrorOr<FullyParsedPose>;
export type ParsedConstInterp = { heading: ParsedValue };
export type ParsedFacePtInterp = { point: ParsedPose };
export type ParsedLinearInterp = {
  startHeading: ParsedValue;
  endHeading: ParsedValue;
  longWay: boolean;
};
export type ParsedInterpPiece = {
  until: ParsedValue;
  interpolater: ParsedInterpolator;
};
export type ParsedPieceWiseInterp = { pieces: ParsedInterpPiece[] };
export type FullyParsedInterpolator =
  | ParsedConstInterp
  | ParsedFacePtInterp
  | ParsedLinearInterp
  | TangentInterp
  | ParsedPieceWiseInterp;
export type ParsedInterpolator = ErrorOr<FullyParsedInterpolator>;
export type FullyParsedCurve = {
  points: ParsedPose[];
  interpolation: ParsedInterpolator;
};
export type ParsedCurve = ErrorOr<FullyParsedCurve>;
export type FullyParsedPath = {
  curves: ParsedCurve[];
  globalInterpolator?: ParsedInterpolator;
};
export type ParsedPath = ErrorOr<FullyParsedPath>;
export type FullyParsedNamedValues = {
  values: Record<string, ParsedValue>;
  poses: Record<string, ParsedPose>;
  interpolations: Record<string, ParsedInterpolator>;
  curves: Record<string, ParsedCurve>;
  paths: Record<string, ParsedPath>;
};
export type ParsedNameValues = ErrorOr<FullyParsedNamedValues>;

export type JsonPathDatabase = {
  HasFieldImage: boolean;
  TeamFilePaths: TeamFilePaths;
  ParsedFiles: Map<FilePathKey, ParsedNameValues>;
};
