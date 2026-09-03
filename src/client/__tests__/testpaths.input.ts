// SPDX-License-Identifier: AGPL-3.0-or-later

import { MakeMultiMap } from '@freik/containers';
import { isNumber, isString } from '@freik/typechk';

import { EmptyParsedClass } from '../../CodeTypeCheck';
import {
  AnonymousBezier,
  AnonymousInterp,
  AnonymousPose,
  BezierName,
  BezierRef,
  BezierType,
  HeadingRef,
  InterpConstant,
  InterpLinear,
  InterpolationType,
  InterpPiece,
  InterpPiecewise,
  InterpPoint,
  InterpReversed,
  InterpReversible,
  InterpSimple,
  InterpTangent,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  ParsedClass,
  PathChainName,
  PoseName,
  PoseRef,
  RadiansRef,
  ValueName,
  ValueRef,
} from '../../CodeTypes';
import { ClassKey, PathDatabase, PathKey, Team } from '../../IpcTypes';

function mkValueRef(val: number | string): ValueRef {
  if (isString(val)) {
    return val as ValueName;
  } else if (Number.isInteger(val)) {
    return { int: val };
  } else {
    return { double: val };
  }
}

function mkNamedValue(name: string, val: number | string): NamedValue {
  return { name: name as ValueName, value: mkValueRef(val) };
}

function mkRadiansRef(val: number | string): RadiansRef {
  return { radians: mkValueRef(val as ValueName) };
}

function mkNamedRadians(name: string, val: number | string): NamedValue {
  return { name: name as ValueName, value: mkRadiansRef(val) };
}

function mkPoseRef(
  x: number | string,
  y: number | string,
  heading?: number | string,
): PoseRef {
  const pose: AnonymousPose = {
    x: mkValueRef(x),
    y: mkValueRef(y),
  };
  if (heading !== undefined) {
    pose.heading = mkValueRef(heading);
  }
  return pose;
}

function mkNamedPose(
  name: string,
  x: number | string,
  y: number | string,
  heading?: number | string,
): NamedPose {
  const pose: AnonymousPose = {
    x: mkValueRef(x),
    y: mkValueRef(y),
  };
  if (heading !== undefined) {
    pose.heading = mkValueRef(heading);
  }
  return { name: name as PoseName, pose };
}

function mkNamedPoseRad(
  name: string,
  x: number | string,
  y: number | string,
  heading: number | string,
): NamedPose {
  const pose: AnonymousPose = {
    x: mkValueRef(x),
    y: mkValueRef(y),
    heading: mkRadiansRef(heading),
  };
  return { name: name as PoseName, pose };
}

function mkNamedLine(
  name: string,
  start: string | AnonymousPose,
  end: string | AnonymousPose,
): NamedBezier {
  return {
    name: name as BezierName,
    points: {
      type: BezierType.Line,
      points: [start as PoseRef, end as PoseRef],
    },
  };
}

function mkAnonymousBezier(
  ...points: (string | AnonymousPose)[]
): AnonymousBezier {
  return {
    type: points.length === 2 ? BezierType.Line : BezierType.Curve,
    points: points as PoseRef[],
  };
}

function mkNamedCurve(
  name: string,
  points: (string | AnonymousPose)[],
): NamedBezier {
  return {
    name: name as BezierName,
    points: mkAnonymousBezier(...points),
  };
}

function mkNamedPathChain(
  name: string,
  paths: (string | AnonymousBezier)[],
  heading: AnonymousInterp,
): NamedPathChain {
  return {
    name: name as PathChainName,
    paths: paths as BezierRef[],
    heading,
  };
}

function mkInterpTangent(): InterpTangent {
  return { type: InterpolationType.Tangent };
}

function mkInterpConstant(heading: string | HeadingRef): InterpConstant {
  return { type: InterpolationType.Constant, heading: heading as HeadingRef };
}

function mkInterpLinear(
  start: HeadingRef | string,
  end: HeadingRef | string,
): InterpLinear {
  return {
    type: InterpolationType.Linear,
    start: start as HeadingRef,
    end: end as HeadingRef,
  };
}

function mkInterpPoint(point: PoseRef | string): InterpPoint {
  return { type: InterpolationType.Point, point: point as PoseRef };
}

function mkInterpReversed(interp: InterpReversible): InterpReversed {
  return { type: InterpolationType.Reversed, interp };
}

function mkInterpPiece(
  heading: InterpSimple,
  start: number | ValueRef,
  end: number | ValueRef,
): InterpPiece {
  return {
    heading,
    timing: {
      start: isNumber(start) ? { double: start } : start,
      end: isNumber(end) ? { double: end } : end,
    },
  };
}

function mkInterpPiecewise(...pieces: InterpPiece[]): InterpPiecewise {
  return { type: InterpolationType.Piecewise, pieces };
}

export const TestPathsParsed: ParsedClass = {
  name: 'TestPaths',
  unmatchedFields: [],
  fullName: 'org.firstinspires.ftc.learnbot.TestPaths',
  imports: ['org.firstinspires.ftc.learnbot'],
  pathChainHelpers: [],
  container: {
    fileName:
      '../LearnBot/src/main/java/org/firstinspires/ftc/learnbot/TestPaths.java',
  },
  children: {},
  values: [
    mkNamedValue('org', 15),
    mkNamedValue('edge', 50),
    mkNamedValue('orgu', 130),
    mkNamedValue('edgeu', 90),
    mkNamedValue('extra', 25),
    mkNamedValue('extra2', 27),
    mkNamedRadians('one80', 180),
    mkNamedValue('refVal', 'edge'),
    mkNamedValue('sixty', 60),
    mkNamedValue('ninetyD', 90),
    mkNamedRadians('ninety', 'ninetyD'),
  ],
  poses: [
    mkNamedPoseRad('start', 'org', 'org', 0),
    mkNamedPose('step1', 'edge', 'org', 'ninety'),
    mkNamedPose('step2', 'edge', 'refVal', 35),
    mkNamedPoseRad('step3', 'extra', 'extra2', 'sixty'),
    mkNamedPose('step4', 'orgu', 'orgu', 'one80'),
    mkNamedPoseRad('startu', 'orgu', 'orgu', 0),
    mkNamedPose('step1u', 'edgeu', 'orgu', 'ninety'),
    mkNamedPose('step2u', 'edgeu', 'refVal', 35),
    mkNamedPoseRad('step3u', 'extra', 'extra2', 'sixty'),
    mkNamedPose('step4u', 'orgu', 'orgu', 'one80'),
    mkNamedPoseRad('stepb', 'extra', 'extra2', 'sixty'),
    mkNamedPose('stepc', 15, 20),
    mkNamedPoseRad('stepd', 18, 55, 135),
  ],
  beziers: [
    mkNamedLine('start_to_step1', 'start', 'step1'),
    mkNamedCurve('unused1', ['step1', 'step2', 'step4', 'step1']),
    mkNamedCurve('step1_to_step2', ['step1', 'stepb', 'step2']),
    mkNamedLine('u1_u2', 'step1', mkPoseRef('org', 'edge')),
    mkNamedLine('unused2', mkPoseRef('org', 'edge'), 'start'),
    mkNamedLine('u2_u3', 'start', mkPoseRef('edge', 5, 15)),
    mkNamedCurve('unused3', [
      mkPoseRef('edge', 5, 15),
      'start',
      mkPoseRef(5, 5),
    ]),
    mkNamedLine('u3_u4', mkPoseRef(5, 5), 'start'),
    mkNamedCurve('unused4', [
      'start',
      mkPoseRef(15, 25),
      mkPoseRef(55, 44),
      mkPoseRef(10, 'org'),
      mkPoseRef('edge', 10, 'sixty'),
      'step1',
    ]),
    mkNamedLine('u4_ol', 'step1', 'stepc'),
    mkNamedLine('otherLine', 'stepc', 'stepd'),
    mkNamedLine('start_to_step1_5', 'startu', 'step1u'),
    mkNamedCurve('unused1_5', ['step1u', 'step2u', 'step4u', 'step1u']),
    mkNamedLine('u1_u2_5', 'step1u', mkPoseRef('orgu', 'edgeu')),
    mkNamedLine('unused2_5', mkPoseRef('orgu', 'edgeu'), 'startu'),
    mkNamedLine('u2_u3_5', 'startu', mkPoseRef('edgeu', 95, 15)),
    mkNamedCurve('unused3_5', [
      mkPoseRef('edgeu', 95, 15),
      'startu',
      mkPoseRef(95, 95),
    ]),
    mkNamedLine('u3_u4_5', mkPoseRef(5, 5), 'startu'),
    mkNamedCurve('unused4_5', [
      'startu',
      mkPoseRef(95, 125),
      mkPoseRef(85, 133),
      mkPoseRef(130, 'orgu'),
      mkPoseRef('edgeu', 10, 'sixty'),
      'step1u',
    ]),
    mkNamedLine('u4_ol_5', 'step1u', 'stepc'),
    mkNamedLine('otherLine_5', 'stepc', 'stepd'),
  ],
  pathChains: [
    mkNamedPathChain(
      'Path1',
      [
        'start_to_step1',
        'unused1',
        mkAnonymousBezier(
          'step1',
          mkPoseRef(10, 'extra'),
          'step4',
          mkPoseRef('edge', 10),
          'step1',
        ),
      ],
      mkInterpLinear({ int: 0 }, 'ninety'),
    ),
    mkNamedPathChain(
      'Path2',
      [mkAnonymousBezier('step1', 'stepb', 'step2')],
      mkInterpConstant('step3'),
    ),
    mkNamedPathChain(
      'Path3',
      [mkAnonymousBezier('step2', 'step3')],
      mkInterpTangent(),
    ),
    mkNamedPathChain(
      'Path4',
      [mkAnonymousBezier('step3', 'step1u', 'step4')],
      mkInterpPiecewise(
        mkInterpPiece(mkInterpTangent(), 0, 0.2),
        mkInterpPiece(
          mkInterpPoint({ x: { int: 5 }, y: { int: 5 } }),
          0.2,
          0.4,
        ),
        mkInterpPiece(
          mkInterpConstant({
            radians: {
              int: 90,
            },
          }),
          0.4,
          0.6,
        ),
        mkInterpPiece(
          mkInterpLinear({ radians: { int: 90 } }, 'Math.PI'),
          0.6,
          0.8,
        ),
        mkInterpPiece(
          mkInterpReversed(mkInterpLinear('Math.PI', { radians: { int: 90 } })),
          0.8,
          1.0,
        ),
      ),
    ),
    mkNamedPathChain(
      'Path5',
      [
        'unused1_5',
        'u1_u2_5',
        'unused2_5',
        'u2_u3_5',
        'unused3_5',
        'u3_u4_5',
        'unused4_5',
        'u4_ol_5',
        'otherLine_5',
      ],
      mkInterpPoint({
        x: {
          int: 1,
        },
        y: {
          int: 1,
        },
      }),
    ),
  ],
};

// Mocks & phony data for my tests:
const teams: Team[] = ['team1' as Team, 'team2' as Team];
//   ['team1' as Team]: ['path1.java' as Path, 'path2.java' as Path],
//   ['team2' as Team]: ['path3.java' as Path, 'path4.java' as Path],
// };

const testParsedClass: ParsedClass = {
  values: [],
  poses: [],
  beziers: [],
  pathChainHelpers: [],
  pathChains: [],
  container: { fileName: '' },
  children: {},
  name: 'path1.java',
  fullName: 'test.path1',
  imports: [],
  unmatchedFields: [],
};

const simpleBez: AnonymousBezier = {
  type: BezierType.Curve,
  points: [
    { x: 'val1' as ValueName, y: 'val1' as ValueName },
    'pose4' as PoseName,
    'pose2' as PoseName,
  ],
};

export const noParsedClass: ParsedClass = {
  name: 'z',
  fullName: 'test.z',
  imports: [],
  container: { fileName: 'path2.java' },
  children: {},
  values: [],
  poses: [],
  beziers: [],
  pathChains: [],
  pathChainHelpers: [],
  unmatchedFields: [],
};

export const fullParsedClass: ParsedClass = {
  name: 'c',
  fullName: 'test.c',
  unmatchedFields: [],
  imports: [],
  values: [
    { name: 'val1' as ValueName, value: { int: 1 } },
    { name: 'val2' as ValueName, value: { double: 2.5 } },
    { name: 'val3' as ValueName, value: { radians: { int: 90 } } },
  ],
  poses: [
    {
      name: 'pose1' as PoseName,
      pose: { x: { double: 2.5 }, y: 'val1' as ValueName },
    },
    {
      name: 'pose2' as PoseName,
      pose: {
        x: 'val2' as ValueName,
        y: 'val1' as ValueName,
        heading: { radians: { int: 60 } },
      },
    },
    {
      name: 'pose3' as PoseName,
      pose: {
        x: 'val1' as ValueName,
        y: 'val2' as ValueName,
        heading: 'val3' as ValueName,
      },
    },
    {
      name: 'pose4' as PoseName,
      pose: 'pose1' as PoseName,
    },
  ],
  beziers: [
    {
      name: 'bez1' as BezierName,
      points: {
        type: BezierType.Line,
        points: ['pose4' as PoseName, 'pose2' as PoseName],
      },
    },
    {
      name: 'bez2' as BezierName,
      points: simpleBez,
    },
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
          points: ['pose4' as PoseName, 'pose3' as PoseName],
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
  // TODO
  container: { fileName: '' },
  children: {},
  pathChainHelpers: [],
};

export const testDatabase: PathDatabase = {
  HasFieldImage: false,
  TeamPaths: MakeMultiMap<Team, PathKey>([
    [
      'team1' as Team,
      ['team1*path1.java' as PathKey, 'team1*path2.java' as PathKey],
    ],
    [
      'team2' as Team,
      ['team2*path3.java' as PathKey, 'team2*path4.java' as PathKey],
    ],
    ['LearnBot' as Team, ['LearnBot*TestPaths.java' as PathKey]],
  ]),
  PathClasses: MakeMultiMap<PathKey, ClassKey>([
    ['team1*path1.java' as PathKey, ['team1*path1.java;a' as ClassKey]],
    ['team1*path2.java' as PathKey, ['team1*path2.java;b' as ClassKey]],
    ['team2*path3.java' as PathKey, ['team2*path3.java;c' as ClassKey]],
    ['team2*path4.java' as PathKey, ['team2*path4.java;d' as ClassKey]],
    [
      'LearnBot*TestPaths.java' as PathKey,
      ['LearnBot*TestPaths.java;TestPaths' as ClassKey],
    ],
  ]),
  ParsedClasses: new Map<ClassKey, ParsedClass>([
    ['team1*path1.java;a' as ClassKey, EmptyParsedClass],
    ['team1*path2.java;b' as ClassKey, EmptyParsedClass],
    ['team2*path3.java;c' as ClassKey, fullParsedClass],
    ['team2*path4.java;d' as ClassKey, EmptyParsedClass],
    ['LearnBot*TestPaths.java;TestPaths' as ClassKey, TestPathsParsed],
  ]),
};

// Mocks & phony data for my tests:
const teamsForUITest: Team[] = ['team1' as Team, 'team2' as Team];
//   ['team1' as Team]: ['path1.java' as Path, 'path2.java' as Path],
//   ['team2' as Team]: ['path3.java' as Path, 'path4.java' as Path],
// };

export const testParsedClassForUITest: ParsedClass = {
  unmatchedFields: [],
  values: [],
  poses: [],
  beziers: [],
  pathChainHelpers: [],
  pathChains: [],
  container: { fileName: '' },
  children: {},
  name: 'path1.java',
  fullName: 'test.path1',
  imports: [],
};

const BezForUITest: AnonymousBezier = {
  type: BezierType.Curve,
  points: [
    { x: 'val1' as ValueName, y: 'val1' as ValueName },
    'pose1' as PoseName,
    'pose2' as PoseName,
  ],
};

export const ParsedClassForUITest: ParsedClass = {
  name: 'path3.java',
  fullName: 'test.path3',
  unmatchedFields: [],
  imports: [],
  values: [
    { name: 'val1' as ValueName, value: { int: 1 } },
    { name: 'val2' as ValueName, value: { double: 2.5 } },
    { name: 'val3' as ValueName, value: { radians: { int: 90 } } },
  ],
  poses: [
    {
      name: 'pose1' as PoseName,
      pose: { x: { double: 2.5 }, y: 'val1' as ValueName },
    },
    {
      name: 'pose2' as PoseName,
      pose: {
        x: 'val2' as ValueName,
        y: 'val1' as ValueName,
        heading: { radians: { int: 60 } },
      },
    },
    {
      name: 'pose3' as PoseName,
      pose: {
        x: 'val1' as ValueName,
        y: 'val2' as ValueName,
        heading: 'val3' as ValueName,
      },
    },
  ],
  beziers: [
    {
      name: 'bez1' as BezierName,
      points: {
        type: BezierType.Line,
        points: ['pose1' as PoseName, 'pose2' as PoseName],
      },
    },
    {
      name: 'bez2' as BezierName,
      points: BezForUITest,
    },
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
  // TODO
  container: { fileName: '' },
  children: {},
  pathChainHelpers: [],
};

export const status = {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
};

export const databaseForUITest: PathDatabase = {
  HasFieldImage: false,
  TeamPaths: MakeMultiMap<Team, PathKey>([
    [
      'team1' as Team,
      ['team1*path1.java' as PathKey, 'team1*path2.java' as PathKey],
    ],
    [
      'team2' as Team,
      ['team2*path3.java' as PathKey, 'team2*path4.java' as PathKey],
    ],
  ]),
  PathClasses: MakeMultiMap<PathKey, ClassKey>([
    ['team1*path1.java' as PathKey, ['team1*path1.java;a' as ClassKey]],
    ['team1*path2.java' as PathKey, ['team1*path2.java;b' as ClassKey]],
    ['team2*path3.java' as PathKey, ['team2*path3.java;c' as ClassKey]],
    ['team2*path4.java' as PathKey, ['team2*path4.java;d' as ClassKey]],
  ]),
  ParsedClasses: new Map<ClassKey, ParsedClass>([
    ['team1*path1.java;a' as ClassKey, EmptyParsedClass],
    ['team1*path2.java;b' as ClassKey, EmptyParsedClass],
    ['team2*path3.java;c' as ClassKey, ParsedClassForUITest],
    ['team2*path4.java;d' as ClassKey, EmptyParsedClass],
  ]),
};
