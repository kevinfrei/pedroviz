import { ErrorOr } from '@freik/typechk';

import { TangentInterp } from '../DataTypes';

// Value Resolution types (only live in the web stuff)

export type ResolvedValue = ErrorOr<number>;
type CorrectPose = {
  X: ResolvedValue;
  Y: ResolvedValue;
  Heading?: ResolvedValue;
};
export type ResolvedPose = ErrorOr<CorrectPose>;
type CorrectConstInterp = { heading: ResolvedValue };
type CorrectFacePtInterp = { point: ResolvedPose };
type CorrectLinearInterp = {
  startHeading: ResolvedValue;
  endHeading: ResolvedValue;
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
