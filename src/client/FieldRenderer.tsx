// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useCallback, useRef } from 'react';
import { useAtomValue } from 'jotai';

import { tokens } from '@fluentui/tokens';
import { isDefined, isUndefined } from '@freik/typechk';

import { animateBot, BotAnimationState } from './BotAnimation';
import {
  ConcreteHeading,
  CurveDetail,
  EvalCurve,
  EvalCurveDetail,
  EvalInterpolator,
  EvalPose,
  Point,
} from './ConcreteEvalTypes';
import { CloseTo, ptDistance, vector } from './DrawingHelpers';
import { CalculateItems, EvaluateSymbols } from './Evaluation';
import { calcBezierRef, calcInterp } from './ExpressionEval';
import {
  BotDrawStyleAtom,
  CoordVizPercentAtom,
  CurveOptionsAtom,
  PathOptionsAtom,
  PoseOptionsAtom,
  ShowPathHeadingAtom,
  ThemeAtom,
} from './state/SavedSettings';
import {
  selectedKeyAtom,
  selectedPathOrCurveKeyAtom,
  symbolTableAtom,
} from './state/SymbolTable';
import {
  ColorsAtom,
  FocusedPathAtom,
  NamedPathChainsAtom,
  SelectedParsedClassAtom,
} from './state/UserCode';
import {
  ControlPointStyle,
  CtrlPtStyles,
  CurveStyle,
  HeadingStyle,
  PathStyle,
} from './types';
import { ResponsiveSquareCanvas } from './ui-tools/ResponsiveSquareCanvas';

export function FieldRenderer(): ReactElement {
  const theme = useAtomValue(ThemeAtom);
  const coordViz = useAtomValue(CoordVizPercentAtom);

  const showPathHeadings = useAtomValue(ShowPathHeadingAtom);
  const pathStyle = useAtomValue(PathOptionsAtom);

  const curveOpts = useAtomValue(CurveOptionsAtom);
  const poseOpts = useAtomValue(PoseOptionsAtom);
  const botStyle = useAtomValue(BotDrawStyleAtom);

  const colors = useAtomValue(ColorsAtom);
  const allPCs = useAtomValue(NamedPathChainsAtom);
  const file = useAtomValue(SelectedParsedClassAtom);

  const focusedPath = useAtomValue(FocusedPathAtom);

  const symbolTable = useAtomValue(symbolTableAtom);
  const selected = useAtomValue(selectedKeyAtom);
  const selectedPathOrCurveKey = useAtomValue(selectedPathOrCurveKeyAtom);

  const concretePaths = new Map(
    allPCs.map((npc) => [
      npc.name,
      npc.paths.map((br): [Point[], ConcreteHeading] => [
        calcBezierRef(br, file),
        calcInterp(npc.heading, file),
      ]),
    ]),
  );

  const points = [...concretePaths.values()].flatMap((val) => val);

  const evaluated = EvaluateSymbols(symbolTable);
  const correct = CalculateItems(evaluated);

  const renderField = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      // Map logical 144×144 units into square
      const size = ctx.canvas.width;
      const scale = size / 144;

      // Move the origin to the lower left, corner, and scale it up
      // ctx.translate(0, size);
      // ctx.scale(scale, -scale);
      // or just a single line of code:
      ctx.setTransform(scale, 0, 0, -scale, 0, size);
      ctx.globalAlpha = coordViz;
      drawLegend(ctx, 1, scale, theme);
      ctx.globalAlpha = 1.0;

      correct.paths.forEach(({ curves, globalInterpolator } /*, name */) => {
        curves.forEach(({ points, interpolator }: EvalCurve) => {
          drawCurve(
            ctx,
            points,
            showPathHeadings
              ? globalInterpolator || interpolator || false
              : false,
            pathStyle,
            colors[0]!,
          );
        });
      });

      // TODO: Draw the selected curve differently
      correct.curves.forEach(({ points, interpolator } /*, name*/) => {
        drawCurve(
          ctx,
          points,
          showPathHeadings ? interpolator : false,
          pathStyle,
          colors[1]!,
        );
      });

      // Draw all the named points, as well
      drawControlPoints(
        ctx,
        pathStyle.Curves.ControlPoint,
        correct.poses.values(),
        colors[3]!,
      );
    },
    [
      allPCs,
      colors,
      coordViz,
      correct,
      curveOpts,
      file,
      pathStyle,
      points,
      poseOpts,
      selected,
      showPathHeadings,
      symbolTable,
      theme,
    ],
  );

  const animationStateRef = useRef<BotAnimationState>({
    name: selectedPathOrCurveKey,
    curveIndex: 0,
    curvePoint: 0,
    count: 60,
    curves: [],
  });
  const animate = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      const size = ctx.canvas.width;
      const scale = size / 144;
      const selectedConcretePath = concretePaths.get(focusedPath!.name);
      if (!selectedConcretePath) {
        return;
      }
      ctx.save();
      ctx.setTransform(scale, 0, 0, -scale, 0, size);
      animateBot(
        ctx,
        selectedPathOrCurveKey,
        selectedConcretePath,
        animationStateRef.current,
        botStyle,
      );
      ctx.restore();
    },
    [selectedPathOrCurveKey, concretePaths, botStyle],
  );

  return (
    <ResponsiveSquareCanvas
      anchor={{ x: 'right', y: 'top' }}
      render={renderField}
      animate={focusedPath && animate}
    />
  );
}

function drawFocusedPose(
  poseStyle: { Points: ControlPointStyle; Headings: HeadingStyle },
  ctx: CanvasRenderingContext2D,
  focusedPose: EvalPose,
) {
  ctx.strokeStyle = tokens.colorNeutralForeground1; // TODO: Update this
  drawPoint(ctx, focusedPose, poseStyle.Points);
  ctx.stroke();
  if (isDefined(focusedPose.radians)) {
    drawHeadingLine(
      ctx,
      poseStyle.Headings,
      tokens.colorNeutralForeground1,
      focusedPose,
    );
  }
}

function drawCurveLine(
  ctx: CanvasRenderingContext2D,
  curve: EvalCurveDetail,
  color: string,
  opts: CurveStyle,
): void {
  if (
    curve.length > 0 &&
    curve.controlPoints.length > 0 &&
    !CloseTo(opts.Thickness, 0)
  ) {
    ctx.beginPath();
    ctx.lineWidth = opts.Thickness;
    ctx.strokeStyle = color;
    ctx.moveTo(curve.controlPoints[0]!.x, curve.controlPoints[0]!.y);
    for (const pt of curve.points) {
      ctx.lineTo(pt.x, pt.y);
    }
    const endpt = curve.controlPoints[curve.controlPoints.length - 1];
    if (endpt) {
      ctx.lineTo(endpt.x, endpt.y);
    }
    ctx.stroke();
  }
}

// TODO: Draw the heading lines!
function drawCurve(
  ctx: CanvasRenderingContext2D,
  curve: EvalCurveDetail,
  interpolator: EvalInterpolator | false,
  pathStyle: PathStyle,
  color: string,
) {
  drawCurveLine(ctx, curve, color, pathStyle.Curves);
  drawControlPoints(
    ctx,
    pathStyle.Curves.ControlPoint,
    curve.controlPoints,
    color,
  );
  // TODO: draw the heading interpolators
}

function drawPoint(
  ctx: CanvasRenderingContext2D,
  pt: EvalPose,
  style: ControlPointStyle,
) {
  ctx.lineWidth = style.Thickness;
  const half = style.Size / 2;
  const shape = style.Style;
  switch (shape) {
    case CtrlPtStyles.Circle:
      ctx.moveTo(pt.x + half, pt.y);
      ctx.arc(pt.x, pt.y, half, 0, 2 * Math.PI);
      break;
    case CtrlPtStyles.Square:
      ctx.rect(pt.x - half, pt.y - half, style.Size, style.Size);
      break;
    case CtrlPtStyles.X:
      ctx.moveTo(pt.x - half, pt.y - half);
      ctx.lineTo(pt.x + half, pt.y + half);
      ctx.moveTo(pt.x - half, pt.y + half);
      ctx.lineTo(pt.x + half, pt.y - half);
      break;
    case CtrlPtStyles.Triangle:
      ctx.moveTo(pt.x - half, pt.y - half);
      ctx.lineTo(pt.x, pt.y + half);
      ctx.lineTo(pt.x + half, pt.y - half);
      ctx.closePath();
      break;
    case CtrlPtStyles.Crosshair:
      ctx.moveTo(pt.x - half, pt.y);
      ctx.lineTo(pt.x + half, pt.y);
      ctx.moveTo(pt.x, pt.y + half);
      ctx.lineTo(pt.x, pt.y - half);
      break;
  }
}

function drawControlPoints(
  ctx: CanvasRenderingContext2D,
  opts: ControlPointStyle,
  curveControlPoints: Iterable<EvalPose>,
  color: string,
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  for (const pt of curveControlPoints) {
    drawPoint(ctx, pt, opts);
  }
  ctx.stroke();
}

function drawHeadingLines(
  ctx: CanvasRenderingContext2D,
  color: string,
  curve: CurveDetail,
  headingCount: number,
  headingStyle: HeadingStyle,
) {
  // for "n" points, I'm not drawing starting/ending headings, so I actually
  // want to split the length into n + 1 pieces, and find the last point in
  // between each piece
  const pieceLen = curve.length / (headingCount + 1);
  if (headingCount <= 0 || curve.points.length < 3) {
    return;
  }
  let totalDist = 0;
  let lastPoint = curve.points[0]!;
  let curTarget = pieceLen;
  // Just walk the points, checking the distance to the next target.
  for (const curPoint of curve.points) {
    // Let's figure out how far along the curve we are...
    const ptDist = ptDistance(lastPoint, curPoint);
    const newDist = totalDist + ptDist;
    if (newDist >= curTarget) {
      // Interpolate between the two points. This looks backward
      // because for scaling, the smaller number is the weight for
      // the furthest away point...
      const nextPortion = (curTarget - totalDist) / ptDist;
      const prevPortion = (newDist - curTarget) / ptDist;
      const avg = {
        x: prevPortion * lastPoint.x + nextPortion * curPoint.x,
        y: prevPortion * lastPoint.y + nextPortion * curPoint.y,
        h: prevPortion * lastPoint.h! + nextPortion * curPoint.h!,
      };

      // we're progressing further from the target than the previous point, so
      // draw the heading at the previous point
      drawHeadingLine(ctx, headingStyle, color, avg);
      curTarget += pieceLen;
    }
    lastPoint = curPoint;
    totalDist = newDist;
  }
}

function drawHeadingLine(
  ctx: CanvasRenderingContext2D,
  style: HeadingStyle,
  color: string,
  point: EvalPose,
) {
  if (isUndefined(point.radians)) {
    return;
  }
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineWidth = style.Thickness;
  ctx.strokeStyle = color;
  ctx.moveTo(point.x, point.y);
  const displacement = vector(point.radians, style.Length);
  const endx = point.x + displacement.x;
  const endy = point.y + displacement.y;
  ctx.lineTo(endx, endy);
  ctx.stroke();
  // Draw a little arrow point:
  const angle = Math.atan2(displacement.y, displacement.x);
  const headSize = style.Length * style.ArrowPercent;
  ctx.beginPath();
  ctx.lineCap = 'square';
  ctx.moveTo(
    endx - headSize * Math.cos(angle - style.ArrowAngle),
    endy - headSize * Math.sin(angle - style.ArrowAngle),
  );
  ctx.lineTo(endx, endy);
  ctx.lineTo(
    endx - headSize * Math.cos(angle + style.ArrowAngle),
    endy - headSize * Math.sin(angle + style.ArrowAngle),
  );
  ctx.stroke();
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  scale: number,
  theme: string,
) {
  const outlineText = (str: string, x: number, y: number) => {
    ctx.strokeText(str, x, y);
    ctx.fillText(str, x, y);
  };
  ctx.save();
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.font = '4px sans-serif'; // Set font size and family
  ctx.fillStyle = theme === 'light' ? 'black' : 'white'; // Set fill color for the text
  ctx.strokeStyle = theme === 'light' ? 'white' : 'black';
  ctx.lineWidth = 0.2;

  // Draw the coordinate points
  ctx.textAlign = 'start'; // Set text alignment (e.g., "start", "end", "center")
  ctx.textBaseline = 'middle'; // Set vertical alignment (e.g., "top", "middle", "bottom")
  outlineText('(0,0)', 2, 139);
  outlineText('(0,144)', 2, 5);
  ctx.textAlign = 'end'; // Set text alignment (e.g., "start", "end", "center")
  outlineText('(144,0)', 142, 5);
  outlineText('(144,144)', 142, 139);
  ctx.textAlign = 'center'; // Set text alignment (e.g., "start", "end", "center")
  outlineText('(72,72)', 72, 72);

  // Label the axis directions
  outlineText('+y', 71, 84.5);
  outlineText('-y', 71, 104.5);
  outlineText('-x', 62, 95);
  outlineText('+x', 82, 95);

  // Label the compass angles
  outlineText('½π 90°', 72, 40);
  outlineText('0°', 81, 48);
  outlineText('π 180°', 58, 48);
  outlineText('³/₂π 270°', 72, 56);

  // Draw the axis directions
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = theme === 'light' ? 'black' : 'white';
  ctx.beginPath();
  let xc = 72;
  let yc = 95;
  // Vertical double arrow:
  ctx.moveTo(xc - 2, yc - 5);
  ctx.lineTo(xc, yc - 7);
  ctx.lineTo(xc + 2, yc - 5);
  ctx.moveTo(xc, yc - 7);
  ctx.lineTo(xc, yc + 7);
  ctx.moveTo(xc + 2, yc + 5);
  ctx.lineTo(xc, yc + 7);
  ctx.lineTo(xc - 2, yc + 5);
  // Horizontal double arrow
  ctx.moveTo(xc - 5, yc - 2);
  ctx.lineTo(xc - 7, yc);
  ctx.lineTo(xc - 5, yc + 2);
  ctx.moveTo(xc - 7, yc);
  ctx.lineTo(xc + 7, yc);
  ctx.moveTo(xc + 5, yc + 2);
  ctx.lineTo(xc + 7, yc);
  ctx.lineTo(xc + 5, yc - 2);
  // Arrow for the compass
  ctx.moveTo(77 + 1, 48 + 2);
  ctx.lineTo(77, 48);
  ctx.lineTo(77 - 1.75, 48 + 1.75);
  ctx.stroke();
  ctx.beginPath();
  // Arc for the compass
  ctx.arc(72, 48, 5, Math.PI * -0.25, 0, true);
  ctx.stroke();
  ctx.restore();
}
