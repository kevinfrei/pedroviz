// Simple types (these live in the JSON file, too)

export type Ref = { ref: string };
export type Value = { val: number };
export type ValRef = Value | Ref;
export type Pose = {
  X: ValRef;
  Y: ValRef;
  Heading?: ValRef;
  inRadians?: boolean;
};
export type PoseRef = Pose | Ref;

export type InterpRef = Interpolator | Ref;
export type PieceWiseInterp = { pieces: InterpPiece[] };
export type TangentInterp = { reversed: boolean };
export type InterpPiece = { until: ValRef; interpolator: InterpRef };
export type LinearInterp = {
  startHeading: ValRef;
  endHeading: ValRef;
  longWay: boolean;
};
export type FacePtInterp = { point: PoseRef };
export type ConstInterp = { heading: ValRef };
export type Interpolator =
  ConstInterp | FacePtInterp | LinearInterp | PieceWiseInterp | TangentInterp;

export type Curve = { points: PoseRef[]; interpolation: InterpRef };
export type CurveRef = Curve | Ref;

export type Path = { curves: CurveRef[]; globalInterpolator?: InterpRef };

export type SymbolTable = {
  values: Map<string, ValRef>;
  poses: Map<string, PoseRef>;
  interpolations: Map<string, InterpRef>;
  curves: Map<string, CurveRef>;
  paths: Map<string, Path>;
};
const InterpNamesArray = [
  'Constant',
  'Facing',
  'Linear',
  'Tangent',
  'PieceWise',
  'Reference',
] as const;
export type InterpNames = (typeof InterpNamesArray)[number];
export type NamedValues = {
  values: Record<string, ValRef>;
  poses: Record<string, PoseRef>;
  interpolations: Record<string, InterpRef>;
  curves: Record<string, CurveRef>;
  paths: Record<string, Path>;
};
