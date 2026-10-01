import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  ErrorOr,
  isBoolean,
  isError,
  isNumber,
  isString,
  typecheck,
} from '@freik/typechk';

export type Ref = { ref: string };
export type Value = { val: number };
export type ValRef = Value | Ref;
export type ResolvedValue = ErrorOr<number>;

export type Pose = {
  X: ValRef;
  Y: ValRef;
  Heading?: ValRef;
  inRadians?: boolean;
};
export type PoseRef = Pose | Ref;
export type CorrectPose = {
  X: ResolvedValue;
  Y: ResolvedValue;
  Heading?: ResolvedValue;
};
export type ResolvedPose = ErrorOr<CorrectPose>;

export type ConstInterp = { heading: ValRef };
export type CorrectConstInterp = { heading: ResolvedValue };
export type FacePtInterp = { point: PoseRef };
export type CorrectFacePtInterp = { point: ResolvedPose };
export type LinearInterp = {
  startHeading: ValRef;
  endHeading: ValRef;
  longWay: boolean;
};
export type CorrectLinearInterp = {
  startHeading: ResolvedValue;
  endHeading: ResolvedValue;
  longWay: boolean;
};
export type TangentInterp = { reversed: boolean };
export type InterpPiece = { until: ValRef; interpolator: InterpRef };
export type CorrectInterpPiece = {
  until: ResolvedValue;
  interpolater: ResolvedInterpolator;
};
export type PieceWiseInterp = { pieces: InterpPiece[] };
export type CorrectPieceWiseInterp = { pieces: CorrectInterpPiece[] };

export type Interpolator =
  ConstInterp | FacePtInterp | LinearInterp | PieceWiseInterp | TangentInterp;
export type InterpRef = Interpolator | Ref;

export type CorrectInterpolator =
  | CorrectConstInterp
  | CorrectFacePtInterp
  | CorrectLinearInterp
  | TangentInterp
  | CorrectPieceWiseInterp;
export type ResolvedInterpolator = ErrorOr<CorrectInterpolator>;

export type Curve = { points: PoseRef[]; interpolation: InterpRef };
export type CurveRef = Curve | Ref;
export type CorrectCurve = {
  points: ResolvedPose[];
  interpolation: ResolvedInterpolator;
};
export type ResolvedCurve = ErrorOr<CorrectCurve>;

export type Path = { curves: CurveRef[]; globalInterpolator?: InterpRef };
export type CorrectPath = {
  curves: ResolvedCurve[];
  globalInterpolator?: ResolvedInterpolator;
};
export type ResolvedPath = ErrorOr<CorrectPath>;

export type NamedValues = {
  values: Record<string, ValRef>;
  poses: Record<string, PoseRef>;
  interpolations: Record<string, InterpRef>;
  curves: Record<string, CurveRef>;
  paths: Record<string, Path>;
};

export type SymbolTable = {
  values: Map<string, ValRef>;
  poses: Map<string, PoseRef>;
  interpolations: Map<string, InterpRef>;
  curves: Map<string, CurveRef>;
  paths: Map<string, Path>;
};

export const InterpNamesArray = [
  'Constant',
  'Facing',
  'Linear',
  'Tangent',
  'PieceWise',
  'Reference',
] as const;
export type InterpNames = (typeof InterpNamesArray)[number];

export function getInterpType(interp: InterpRef): InterpNames {
  if (chkRef(interp)) {
    return 'Reference';
  }
  if (chkConstInterp(interp)) {
    return 'Constant';
  }
  if (chkFacePtInterp(interp)) {
    return 'Facing';
  }
  if (chkLinearInterp(interp)) {
    return 'Linear';
  }
  if (chkTangentInterp(interp)) {
    return 'Tangent';
  }
  if (chkPieceWiseInterp(interp)) {
    return 'PieceWise';
  }
  throw new Error('Invalid Interpolator...');
}

// Type checkers:
export const chkErr = isError;
export const chkRef = chkObjectOfExactType<Ref>({ ref: isString });
export const chkValue = chkObjectOfExactType<Value>({ val: isNumber });
export const chkValRef = chkAnyOf(chkRef, chkValue);
export const chkPose = chkObjectOfExactType<Pose>(
  {
    X: chkValRef,
    Y: chkValRef,
  },
  {
    Heading: chkValRef,
    inRadians: isBoolean,
  },
);
export const chkPoseRef = chkAnyOf(chkRef, chkPose);
export const chkConstInterp = chkObjectOfExactType<ConstInterp>({
  heading: chkValRef,
});
export const chkFacePtInterp = chkObjectOfExactType<FacePtInterp>({
  point: chkPoseRef,
});
export const chkLinearInterp = chkObjectOfExactType<LinearInterp>({
  startHeading: chkValRef,
  endHeading: chkValRef,
  longWay: isBoolean,
});
export const chkTangentInterp = chkObjectOfExactType<TangentInterp>({
  reversed: isBoolean,
});
// have to declare a function, because recursion and delayed binding and stuff
export const chkInterpPiece: typecheck<InterpPiece> = (obj: unknown) =>
  chkObjectOfExactType<InterpPiece>({
    until: chkValRef,
    interpolator: chkInterpRef,
  })(obj);
export const chkPieceWiseInterp = chkObjectOfExactType<PieceWiseInterp>({
  pieces: chkArrayOf(chkInterpPiece),
});
export const chkInterpolator: typecheck<Interpolator> = chkAnyOf(
  chkConstInterp,
  chkFacePtInterp,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkTangentInterp,
);
export const chkInterpRef: typecheck<InterpRef> = (obj: unknown) =>
  chkAnyOf(chkRef, chkInterpolator)(obj);

export const chkCurve = chkObjectOfExactType<Curve>({
  points: chkArrayOf(chkPoseRef),
  interpolation: chkInterpRef,
});
export const chkCurveRef = chkAnyOf(chkRef, chkCurve);

export const chkPath = chkObjectOfExactType<Path>(
  { curves: chkArrayOf(chkCurveRef) },
  { globalInterpolator: chkInterpRef },
);

export const chkNamedValues = chkObjectOfExactType<NamedValues>({
  values: chkArrayOf(chkValRef),
  poses: chkArrayOf(chkPoseRef),
  curves: chkArrayOf(chkCurveRef),
  interpolations: chkArrayOf(chkInterpRef),
  paths: chkArrayOf(chkPath),
});
