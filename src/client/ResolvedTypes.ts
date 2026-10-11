import { ErrorOr } from '@freik/typechk';

import { TangentInterp } from '../DataTypes';

// Value Resolution types (only live in the web stuff)

export type ResolvedValue = ErrorOr<number>;

type CorrectHeading = {
  angle: ResolvedValue;
  inRadians: boolean;
};
export type ResolvedHeading = ErrorOr<CorrectHeading>;

type CorrectPose = {
  X: ResolvedValue;
  Y: ResolvedValue;
  heading?: ResolvedHeading;
};
export type ResolvedPose = ErrorOr<CorrectPose>;
type CorrectConstInterp = { heading: ResolvedHeading };
type CorrectFacePtInterp = { point: ResolvedPose };
type CorrectLinearInterp = {
  start: ResolvedHeading;
  end: ResolvedHeading;
  longWay: boolean;
};
type CorrectInterpPiece = {
  until: ResolvedValue;
  interpolater: ResolvedInterpolator;
};
type CorrectPieceWiseInterp = { pieces: CorrectInterpPiece[] };
type CorrectInterpolator =
  | CorrectConstInterp
  | CorrectFacePtInterp
  | CorrectLinearInterp
  | TangentInterp
  | CorrectPieceWiseInterp;
export type ResolvedInterpolator = ErrorOr<CorrectInterpolator>;
type CorrectCurve = {
  points: ResolvedPose[];
  interpolation: ResolvedInterpolator;
};
export type ResolvedCurve = ErrorOr<CorrectCurve>;
type CorrectPath = {
  curves: ResolvedCurve[];
  globalInterpolator?: ResolvedInterpolator;
};
type ResolvedPath = ErrorOr<CorrectPath>;
