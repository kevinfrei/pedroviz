// SPDX-License-Identifier: AGPL-3.0-or-later

import { chkMultiMapOf, MakeMultiMap } from '@freik/containers';
import {
  chkAnyOf,
  chkArrayOf,
  chkMapOf,
  chkObjectOfExactType,
  chkRecordOf,
  ErrorOr,
  isBoolean,
  isError,
  isString,
  typecheck,
} from '@freik/typechk';

import { chkParsedClass } from './CodeTypeCheck';
import { ParsedClass } from './CodeTypes';
import { chkTangentInterp, chkValRef } from './DataTypeChecks';
import {
  ClassKey,
  ClassName,
  FilePath,
  FilePathKey,
  FullyParsedCurve,
  FullyParsedInterpolator,
  FullyParsedNamedValues,
  FullyParsedPath,
  FullyParsedPose,
  JsonPathDatabase,
  ParsedConstInterp,
  ParsedCurve,
  ParsedFacePtInterp,
  ParsedInterpolator,
  ParsedInterpPiece,
  ParsedLinearInterp,
  ParsedNameValues,
  ParsedPath,
  ParsedPieceWiseInterp,
  ParsedPose,
  ParsedValue,
  PathDatabase,
  Team,
} from './IpcTypes';

export function GetPathKey(team: Team, path: FilePath): FilePathKey {
  return `${team}*${path}` as FilePathKey;
}

export function FilePathFromKey(pathKey: FilePathKey): FilePath {
  const elems = pathKey.split('*');
  return (elems.pop() || '') as FilePath;
}

export function chkPathKey(obj: unknown): obj is FilePathKey {
  if (!isString(obj)) {
    return false;
  }
  const pieces = obj.split('*');
  return pieces.length === 2;
}

export function GetClassKey(pathKey: FilePathKey, className: string): ClassKey {
  return `${pathKey};${className}` as ClassKey;
}

export function ClassFromKey(classKey: ClassKey): ClassName {
  const elems = classKey.split(';');
  return (elems.pop() || '') as ClassName;
}

/*export*/ function chkClassKey(obj: unknown): obj is ClassKey {
  if (!isString(obj)) {
    return false;
  }
  const pieces = obj.split(';');
  return pieces.length === 2 && chkPathKey(pieces[0]);
}

export const chkPathDatabase = chkObjectOfExactType<PathDatabase>({
  HasFieldImage: isBoolean,
  TeamPaths: chkMultiMapOf(isString, chkPathKey),
  PathClasses: chkMultiMapOf(chkPathKey, chkClassKey),
  ParsedClasses: chkMapOf(chkClassKey, chkParsedClass),
});

export const EmptyPathDatabase: PathDatabase = Object.freeze({
  HasFieldImage: false,
  TeamPaths: MakeMultiMap<Team, FilePathKey>(),
  PathClasses: MakeMultiMap<FilePathKey, ClassKey>(),
  ParsedClasses: new Map<ClassKey, ParsedClass>(),
});

export const chkParsedValue: typecheck<ParsedValue> = chkAnyOf(
  isError,
  chkValRef,
);
export const chkFullyParsedPose = chkObjectOfExactType<FullyParsedPose>(
  { X: chkParsedValue, Y: chkParsedClass },
  { Heading: chkParsedValue },
);
export const chkParsedPose: typecheck<ParsedPose> = chkAnyOf(
  isError,
  chkFullyParsedPose,
);
export const chkParsedConstInterp = chkObjectOfExactType<ParsedConstInterp>({
  heading: chkParsedValue,
});
export const chkParsedFacePtInterp = chkObjectOfExactType<ParsedFacePtInterp>({
  point: chkParsedPose,
});
export const chkParsedLinearInterp = chkObjectOfExactType<ParsedLinearInterp>({
  startHeading: chkParsedValue,
  endHeading: chkParsedValue,
  longWay: isBoolean,
});
export const chkParsedInterpPiece: typecheck<ParsedInterpPiece> = (
  val: unknown,
): val is ParsedInterpPiece => {
  return chkObjectOfExactType<ParsedInterpPiece>({
    until: chkParsedValue,
    interpolater: chkParsedInterpolator,
  })(val);
};
export const chkParsedPieceWiseInterp =
  chkObjectOfExactType<ParsedPieceWiseInterp>({
    pieces: chkArrayOf(chkParsedInterpPiece),
  });
export const chkFullyParsedInterpolator: typecheck<FullyParsedInterpolator> =
  chkAnyOf(
    chkParsedConstInterp,
    chkParsedFacePtInterp,
    chkParsedLinearInterp,
    chkTangentInterp,
    chkParsedPieceWiseInterp,
  );
export const chkParsedInterpolator: typecheck<ParsedInterpolator> = chkAnyOf(
  isError,
  chkFullyParsedInterpolator,
);
export const chkFullyParsedCurve = chkObjectOfExactType<FullyParsedCurve>({
  points: chkArrayOf(chkParsedPose),
  interpolation: chkParsedInterpolator,
});
export const chkParsedCurve: typecheck<ParsedCurve> = chkAnyOf(
  isError,
  chkFullyParsedCurve,
);
export const chkFullyParsedPath = chkObjectOfExactType<FullyParsedPath>(
  {
    curves: chkArrayOf(chkParsedCurve),
  },
  {
    globalInterpolator: chkParsedInterpolator,
  },
);
export const chkParsedPath: typecheck<ParsedPath> = chkAnyOf(
  isError,
  chkFullyParsedPath,
);
export const chkFullyParsedNamedValues =
  chkObjectOfExactType<FullyParsedNamedValues>({
    values: chkRecordOf(isString, chkParsedValue),
    poses: chkRecordOf(isString, chkParsedPose),
    interpolations: chkRecordOf(isString, chkParsedInterpolator),
    curves: chkRecordOf(isString, chkParsedCurve),
    paths: chkRecordOf(isString, chkParsedPath),
  });
export const chkParsedNameValues: typecheck<ParsedNameValues> = chkAnyOf(
  isError,
  chkFullyParsedNamedValues,
);
export const chkJsonPathDatabase = chkObjectOfExactType<JsonPathDatabase>({
  HasFieldImage: isBoolean,
  TeamFilePaths: chkMultiMapOf(isString, chkClassKey),
  ParsedFiles: chkMapOf(chkClassKey, chkParsedNameValues),
});

export const EmptyJsonDatatbase: JsonPathDatabase = Object.freeze({
  HasFieldImage: false,
  TeamFilePaths: MakeMultiMap<Team, FilePathKey>(),
  ParsedFiles: new Map(),
});
