// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from 'bun:test';

import { EmptyParsedClass } from '../../CodeTypeCheck';
import { ValueName, ValueRef } from '../../CodeTypes';
import { ConcreteHeadingType } from '../ConcreteEvalTypes';
import {
  calcBezierRef,
  calcFacing,
  calcPoseRef,
  calcValue,
  calcValueRef,
  GetValueAsString,
  readConstant,
} from '../ExpressionEval';
import { GetNameLookup, MakeFileIndex } from '../state/IndexedFile';
import { fullParsedClass, testDatabase } from './testpaths.input';

describe('Expression Evaluation', () => {
  test('Constants', () => {
    expect(readConstant('123')).toEqual(undefined);
    expect(readConstant('123.456')).toEqual(undefined);
    expect(readConstant('Math.PI')).toEqual(Math.PI);
    expect(readConstant('Math.E')).toEqual(Math.E);
  });
  test('Stringification', () => {
    expect(GetValueAsString({ int: 123 })).toEqual('123');
    expect(GetValueAsString({ double: 123.456 })).toEqual('123.46');
    expect(GetValueAsString('varName' as ValueName)).toEqual('varName');
  });
  test('calcValue', () => {
    expect(calcValue({ int: 123 }, EmptyParsedClass)).toEqual(123);
    expect(calcValue({ double: 12.3 }, EmptyParsedClass)).toEqual(12.3);
    expect(calcValue({ radians: { double: 180 } }, EmptyParsedClass)).toEqual(
      3.141592653589793,
    );
  });
  test('general calculationsd', () => {
    const index = MakeFileIndex(fullParsedClass);
    const lkup = GetNameLookup();
    lkup.setDb(testDatabase);
    const val = calcValueRef('val2' as ValueRef, fullParsedClass);
    expect(val).toEqual(2.5);
    const pose = calcPoseRef('pose1', fullParsedClass);
    expect(pose).toEqual({ x: 2.5, y: 1 });
    const pi = 'Math.PI' as ValueName;
    const piVal = calcValueRef(pi, fullParsedClass);
    expect(piVal).toEqual(3.141592653589793);
    const poseHeading = calcPoseRef('pose3', fullParsedClass);
    expect(poseHeading).toEqual({ x: 1, y: 2.5, h: 1.5707963267948966 });
    const poseInder = calcPoseRef('pose4', fullParsedClass);
    expect(poseInder).toEqual(pose);
    const line = calcBezierRef('bez1', fullParsedClass);
    expect(line).toEqual([
      { x: 2.5, y: 1 },
      { x: 2.5, y: 1, h: 1.0471975511965976 },
    ]);
    const curve = calcBezierRef('bez2', fullParsedClass);
    expect(curve).toEqual([
      { x: 1, y: 1 },
      { x: 2.5, y: 1 },
      { x: 2.5, y: 1, h: 1.0471975511965976 },
    ]);
    const pc = index.namedPathChains.get('pc2');
    expect(pc).toBeDefined();
    const heading = calcFacing(pc!.heading, fullParsedClass);
    expect(heading).toEqual({
      type: ConcreteHeadingType.Constant,
      heading: 1.5707963267948966,
    });
  });
});
