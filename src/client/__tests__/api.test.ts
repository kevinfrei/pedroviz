// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from 'bun:test';

import { isError, isNumber, isString } from '@freik/typechk';

import {
  Curve,
  HeadingRef,
  Interpolator,
  InterpRef,
  Path,
  Pose,
  PoseRef,
  ValRef,
  Value,
} from '../../dataTypes';

import '../Evaluation';

import { getColorFor } from '../state/API';

function mkValNm(name: string): string {
  return name;
}
function mkVal(val: number): Value {
  return { val };
}
function mkPose(X: ValRef, Y: ValRef, heading?: HeadingRef): Pose {
  return { X, Y, heading };
}
function mkCurve(...points: PoseRef[]): AnonymousBezier {
  return { type, points };
}
function mkNmBez(name: string, bez: AnonymousBezier | string): NamedBezier {
  return { name: mkBezNm(name), points: bez as BezierRef };
}
function mkPCNm(name: string): PathChainName {
  return name as PathChainName;
}

// Mocks & phony data for my tests:

const testParsedClass: ParsedClass = MakeEmptyParsedClass();
testParsedClass.values.push({
  name: 'item1' as ValueName,
  value: { int: 1 },
});
testParsedClass.poses.push({
  name: 'item1' as PoseName,
  pose: { x: { int: 1 }, y: { int: 1 } },
});

const simpleBez: AnonymousBezier = {
  type: BezierType.Curve,
  points: [
    { x: 'val1' as ValueName, y: 'val1' as ValueName },
    'pose1' as PoseName,
    'pose2' as PoseName,
  ],
};

const fullParsedClass: ParsedClass = {
  ...MakeEmptyParsedClass(),
  name: 'path3.java',
  fullName: 'test.path3',
  values: [
    mkNmVal('val1', mkVal('int', 1)),
    mkNmVal('val2', mkVal('double', 2.5)),
    mkNmVal('val3', mkVal('radians', 90)),
    mkNmVal('valCirc', mkVal('radians', 'valCirc2')),
    mkNmVal('valCirc2', mkVal('radians', 'valCirc')),
    mkNmVal('refVal', mkValNm('val1')),
  ],
  poses: [
    mkNmPose('pose1', mkPose(mkVal('double', 2.5), mkValNm('val1'))),
    mkNmPose(
      'pose2',
      mkPose(mkValNm('val2'), mkValNm('val1'), mkVal('radians', 60)),
    ),
    mkNmPose(
      'pose3',
      mkPose(mkValNm('val1'), mkValNm('val2'), mkValNm('val3')),
    ),
  ],
  beziers: [
    mkNmBez(
      'bez1',
      mkBez(BezierType.Line, mkPoseNm('pose1'), mkPoseNm('pose2')),
    ),
    mkNmBez('bez2', simpleBez),
  ],
  pathChains: [
    {
      name: 'pc1' as PathChainName,
      paths: ['bez1' as BezierName, 'bez2' as BezierName],
      heading: { type: InterpolationType.Tangent },
    },
    {
      name: 'pc2' as PathChainName,
      paths: [
        'bez2' as BezierName,
        {
          type: BezierType.Line,
          points: ['pose1' as PoseName, 'pose3' as PoseName],
        },
      ],
      heading: {
        type: InterpolationType.Constant,
        heading: 'pose3' as PoseName,
      },
    },
    {
      name: 'pc3' as PathChainName,
      paths: [
        'bez1' as BezierName,
        {
          type: BezierType.Curve,
          points: [
            'pose1' as PoseName,
            'pose3' as PoseName,
            'pose2' as PoseName,
          ],
        },
      ],
      heading: {
        type: InterpolationType.Linear,
        start: 'pose2' as PoseName,
        end: { radians: { int: 135 } },
      },
    },
  ],
};

const danglingPC: ParsedClass = {
  ...MakeEmptyParsedClass(),
  name: 'dangling.java',
  fullName: 'test.dangling',
  values: [...fullParsedClass.values],
  poses: [
    ...fullParsedClass.poses,
    mkNmPose('danglingHeader', mkPose('nope', 'val1')),
  ],
  beziers: [
    ...fullParsedClass.beziers,
    mkNmBez(
      'danglingPoseRef',
      mkBez(
        BezierType.Line,
        mkPoseNm('noPose'),
        mkPose('val1', 'not_here', mkVal('radians', 'nuthing')),
      ),
    ),
    mkNmBez(
      'danglingPoseRef2',
      mkBez(BezierType.Curve, mkPose('val1', 'val2', mkValNm('zip'))),
    ),
    mkNmBez(
      'danglingPoseRef3',
      mkBez(BezierType.Line, mkPose('val1', 'val2', mkValNm('zip'))),
    ),
  ],
  pathChains: [
    ...fullParsedClass.pathChains,
    {
      name: 'danglingBezRef' as PathChainName,
      paths: ['noBez' as BezierName],
      heading: {
        type: InterpolationType.Constant,
        heading: 'noHeading' as ValueName,
      },
    },
    {
      name: 'danglingBezRef2' as PathChainName,
      paths: ['bez1' as BezierName, 'bez2' as BezierName],
      heading: {
        type: InterpolationType.Constant,
        heading: { radians: 'nospot' as ValueName },
      },
    },
  ],
};

let bad = false;

const status = {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
};
async function MyFetchFunc(
  key: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  switch (key) {
    case '/api/loadpath/team1/path1.java': {
      const body = JSON.stringify({ a: 'b' });
      return new Response(body, status);
    }
    case '/api/loadpath/team1/path2.java': {
      const body = JSON.stringify(testParsedClass);
      return new Response(body, status);
    }
    case '/api/loadpath/team2/path3.java': {
      const body = JSON.stringify(fullParsedClass);
      return new Response(body, status);
    }
    case '/api/loadpath/team2/path4.java': {
      const body = JSON.stringify(danglingPC);
      return new Response(body, status);
    }
  }
  return new Response('ERROR', { status: 404 });
}
MyFetchFunc.preconnect = () => {};

describe('API validation', () => {
  test('LoadPaths', async () => {
    globalThis.fetch = MyFetchFunc;
    const res2 = await LoadAndIndexFile('team1', 'path1.java');
    expect(isError(res2)).toBeTrue();
    if (isError(res2)) {
      expect(res2.errors()).toEqual(['Invalid ParsedClass loaded from server']);
    }
    const res = await LoadAndIndexFile('team1', 'path2.java');
    expect(isError(res)).toBeTrue();
    if (isError(res)) {
      expect(res.errors()).toEqual([
        'Duplicate names found between values, points, beziers, and path chains.',
        'Loaded file team1/path2.java has dangling references.',
      ]);
    }
  });
  test.skip('Full ParsedClass validation, color hashing, and evaluation', async () => {
    globalThis.fetch = MyFetchFunc;
    const res = await LoadAndIndexFile('team2', 'path3.java');
    if (isError(res)) {
      console.log('Errors:', res.errors());
      expect(isError(res)).toBeFalse();
      return;
    }
    const ctx = res.container;
    expect(res.namedValues.size).toEqual(6);
    expect(res.namedPoses.size).toEqual(3);
    expect(res.namedBeziers.size).toEqual(2);
    expect(res.namedPathChains.size).toEqual(3);

    // expect(calcValue({ int: 1 }, ctx)).toEqual(1);
    // expect(() => calcValueRef('valCirc' as ValueName, ctx)).toThrowError(
    //   'Circular reference for valCirc (valCirc, valCirc2 cause the cycle)',
    // );
    // expect(calcValueRef({ double: 2.5 }, ctx)).toEqual(2.5);
    // expect(calcValueRef({ radians: { int: 180 } }, ctx)).toEqual(Math.PI);
    // expect(calcValueRef('val2' as ValueName, ctx)).toEqual(2.5);
    expect(
      calcPoseRef({ x: 'val1' as ValueName, y: 'val2' as ValueName }, ctx),
    ).toEqual({ x: 1, y: 2.5 });
    const pose3 = calcPoseRef('pose3' as PoseName, ctx);
    expect(pose3).toEqual({ x: 1, y: 2.5 });
    expect(() => calcPoseRef('noPose' as PoseName, ctx)).toThrow();
    expect(calcBezierRef('bez2' as BezierName, ctx)).toEqual([
      { x: 1, y: 1 },
      { x: 2.5, y: 1 },
      { x: 2.5, y: 1 },
    ]);
    // expect(calcValueRef('val1' as ValueName, ctx)).toEqual(1);
    // expect(calcHeadingRef({ radians: 'val2' as ValueName }, ctx)).toEqual(
    //   (2.5 * Math.PI) / 180,
    // );
    // expect(calcValueRef({ int: 15 }, ctx)).toEqual(15);
    // expect(calcValueRef(mkValNm('refVal'), ctx)).toEqual(1);
    // expect(calcPoseRefHeading(mkPoseNm('pose3'), ctx)).toEqual(Math.PI / 2);
    const res2 = await LoadAndIndexFile('team2', 'path3.java');
    expect(!isError(res2)).toBeTrue();
  });
  test.skip('Undefined references in ParsedClass validation', async () => {
    globalThis.fetch = MyFetchFunc;
    const res = await LoadAndIndexFile('team2', 'path4.java');
    expect(isError(res)).toBeTrue();
    if (isError(res)) {
      const errs = res.errors();
      expect(errs.length).toEqual(12);
      const errTxt = String(res);
      expect(errTxt).toEndWith(
        'Loaded file team2/path4.java has dangling references.',
      );
    }
  });
  test('Color hashing', async () => {
    const color1 = getColorFor('test-string');
    expect(color1).toBeDefined();
    const color2 = getColorFor('test-string2');
    expect(color2).toBeDefined();
    expect(color1).not.toEqual(color2);
    const pose: AnonymousPose = { x: { int: 1 }, y: { int: 2 } };
    const color3 = getColorFor(pose);
    expect(color3).not.toEqual(color1);
    expect(color3).not.toEqual(color2);
    expect(getColorFor('test-string2')).toEqual(color2);
  });
  test('Need to implement a real "save" feature', async () => {
    // Probably add a test for this, yeah?
    const res = await SavePath('teamX', 'pathY.java', fullParsedClass);
    expect(res).toEqual('NYI');
  });
});
