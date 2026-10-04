// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkTupleOf,
  isBoolean,
  isNumber,
  typecheck,
} from '@freik/typechk';

import {
  ConcreteConstantHeading,
  ConcreteHeadingType,
  ConcreteLinearHeading,
  ConcretePiecewiseHeading,
  ConcretePointHeading,
  ConcreteSimpleHeading,
  ConcreteTangentHeading,
} from './ConcreteEvalTypes';

const chkPoint = chkObjectOfExactType({ x: isNumber, y: isNumber });

const chkConcreteTangentHeading = chkObjectOfExactType<ConcreteTangentHeading>({
  type: (t: unknown): t is typeof ConcreteHeadingType.Tangent =>
    t === ConcreteHeadingType.Tangent,
  reversed: isBoolean,
});

const chkConcreteConstantHeading =
  chkObjectOfExactType<ConcreteConstantHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Constant =>
      t === ConcreteHeadingType.Constant,
    heading: isNumber,
  });

/*export*/ const chkConcreteLinearHeading =
  chkObjectOfExactType<ConcreteLinearHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Linear =>
      t === ConcreteHeadingType.Linear,
    headings: chkTupleOf(isNumber, isNumber),
    long: isBoolean,
  });

const chkConcretePointHeading = chkObjectOfExactType<ConcretePointHeading>({
  type: (t: unknown): t is typeof ConcreteHeadingType.Point =>
    t === ConcreteHeadingType.Point,
  heading: chkPoint,
});

export const chkConcreteSimpleHeading: typecheck<ConcreteSimpleHeading> =
  chkAnyOf(
    chkConcreteTangentHeading,
    chkConcreteConstantHeading,
    chkConcreteLinearHeading,
    chkConcretePointHeading,
  );

const chkConcretePiece = chkObjectOfExactType({
  start: isNumber,
  end: isNumber,
  heading: chkConcreteSimpleHeading,
});

const chkConcretePieceWiseHeading =
  chkObjectOfExactType<ConcretePiecewiseHeading>({
    type: (t: unknown): t is typeof ConcreteHeadingType.Piecewise =>
      t === ConcreteHeadingType.Piecewise,
    pieces: chkArrayOf(chkConcretePiece),
  });

const chkConcreteHeading = chkAnyOf(
  chkConcretePieceWiseHeading,
  chkConcreteSimpleHeading,
);
