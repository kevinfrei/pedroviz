// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  PointerEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { tokens } from '@fluentui/react-components';
import { DebouncedDelay } from '@freik/sync';
import { ErrorOr, isDefined, isError, isUndefined } from '@freik/typechk';

import { chkRef } from '../dataTypes';
import { animateBot, BotAnimationState } from './BotAnimation';
import {
  ControlPointStyle,
  CtrlPtStyles,
  CurveStyle,
  HeadingStyle,
  PathStyle,
} from './ClientTypes';
import { CloseTo, ptDistance, vector } from './DrawingHelpers';
import {
  CurveDetail,
  EvalCurveDetail,
  EvalPose,
  MovablePoint,
  Point,
  ShallowCurveRef,
  ShallowPath,
} from './EvalTypes';
import { SetMovablePoint } from './PointUpdating';
import {
  animationPathAtom,
  evaluatedSymbolsAtom,
  movablePointsAtom,
  shallowSymbolsAtom,
} from './state/Rendering';
import {
  BotDrawStyleAtom,
  CoordVizPercentAtom,
  PathHeadingCountAtom,
  PathHeadingOptionsAtom,
  PathOptionsAtom,
  ShowPathHeadingAtom,
  ThemeAtom,
} from './state/SavedSettings';
import {
  lastSelectedCurveOrPathAtom,
  symbolTableAtom,
} from './state/SymbolTable';
import { ColorsAtom } from './state/UserCode';
import { ResponsiveSquareCanvas } from './ui-tools/ResponsiveSquareCanvas';
import { calcDist } from './ui-tools/ui-helpers';

const FIELD_SIZE = 144; // Size of the field, in inches
const SELECTION_DISTANCE = 3; // The distance^2 for a selection to be triggered

function unTransform(
  e: PointerEvent<HTMLCanvasElement>,
  p: { x: number; y: number },
) {
  const canvas = e.currentTarget;
  const size = canvas.width;
  const scale = size / FIELD_SIZE;
  return {
    x: Math.round((p.x * 1000) / scale) / 1000,
    y: Math.round(((size - p.y) * 1000) / scale) / 1000,
  };
}

function scaleCanvas(ctx: CanvasRenderingContext2D): number {
  // Map logical 144×144 units into square
  const size = ctx.canvas.width;
  const scale = size / FIELD_SIZE;
  // Move the origin to the lower left, corner, and scale it up
  // ctx.translate(0, size);
  // ctx.scale(scale, -scale);
  // or just a single line of code:
  ctx.setTransform(scale, 0, 0, -scale, 0, size);
  return scale;
}

export function FieldRenderer(): ReactElement {
  const theme = useAtomValue(ThemeAtom);
  const coordViz = useAtomValue(CoordVizPercentAtom);

  const showPathHeadings = useAtomValue(ShowPathHeadingAtom);
  const pathStyle = useAtomValue(PathOptionsAtom);
  const headingStyle = useAtomValue(PathHeadingOptionsAtom);
  const headingCount = useAtomValue(PathHeadingCountAtom);
  const botStyle = useAtomValue(BotDrawStyleAtom);

  const colors = useAtomValue(ColorsAtom);

  const [symbolTable, setSymbolTable] = useAtom(symbolTableAtom);
  const selectedPathOrCurveKey = useAtomValue(lastSelectedCurveOrPathAtom);

  const evaluated = useAtomValue(evaluatedSymbolsAtom);
  const shallow = useAtomValue(shallowSymbolsAtom);

  const movablePoints = useAtomValue(movablePointsAtom);
  const [hovering, setHovering] = useState<MovablePoint | null>(null);
  const [moving, setMoving] = useState<MovablePoint | null>(null);

  const renderField = useCallback(
    (ctx: CanvasRenderingContext2D, _dpr: number) => {
      ctx.save();
      const scale = scaleCanvas(ctx);
      ctx.globalAlpha = coordViz;
      drawLegend(ctx, 1, scale, theme);
      ctx.globalAlpha = 1.0;

      // First, render any in-place curves for paths:
      shallow.paths.forEach(
        (curveDescriptor: ErrorOr<ShallowPath>, pathKey: string) => {
          if (isError(curveDescriptor)) {
            console.error('Error in shallow path', curveDescriptor);
            return;
          }
          curveDescriptor.curves.forEach(
            (curveRef: ShallowCurveRef, curveIndex: number) => {
              if (chkRef(curveRef)) {
                // Don't draw refs: The referenced curve will be drawn in the loop below
                return;
              }
              // Register all in-place control points, so that we can draw (& move!) them later
              // Draw the curve if we didn't have any errors in the points
              const evalPath = evaluated.paths.get(pathKey);
              if (isUndefined(evalPath) || isError(evalPath)) {
                console.error('Error in evaluated path for', pathKey);
                return;
              }
              const evalCurve = evalPath.curves[curveIndex];
              if (isUndefined(evalCurve) || isError(evalCurve)) {
                console.error(
                  'Error in evaluated curve',
                  curveIndex,
                  ', for path',
                  pathKey,
                );
                return;
              }
              // Need to make an EvalCurveDetail from the list of control points...
              drawCurve(ctx, evalCurve.points, pathStyle, colors[3]!);
              if (showPathHeadings) {
                drawHeadingLines(
                  ctx,
                  colors[3]!,
                  evalCurve.points,
                  headingCount,
                  headingStyle,
                );
              }
            },
          );
        },
      );
      shallow.curves.forEach(
        (curveDescriptor: ErrorOr<ShallowCurveRef>, curveKey: string) => {
          if (isError(curveDescriptor)) {
            console.error('Error in shallow curve', curveDescriptor);
            return;
          }
          if (chkRef(curveDescriptor)) {
            // Don't draw refs: The referenced curve will be drawn by it's referenced definition
            return;
          }
          const evalCurve = evaluated.curves.get(curveKey);
          if (isUndefined(evalCurve) || isError(evalCurve)) {
            console.error('Error in evaluated curve for', curveKey);
            return;
          }
          // Need to make an EvalCurveDetail from the list of control points...
          drawCurve(ctx, evalCurve.points, pathStyle, colors[4]!);
          if (showPathHeadings) {
            drawHeadingLines(
              ctx,
              colors[4]!,
              evalCurve.points,
              headingCount,
              headingStyle,
            );
          }
        },
      );
      // TODO: Draw the selected curve differently?

      // Draw all the named points, as well
      drawControlPoints(
        ctx,
        pathStyle.Curves.ControlPoint,
        movablePoints.map((mp) => ({ x: mp.x[0], y: mp.y[0] })),
        colors[5]!,
      );
      if (hovering !== null || moving !== null) {
        const pt: MovablePoint = (moving !== null ? moving : hovering)!;
        drawControlPoints(
          ctx,
          pathStyle.Curves.ControlPoint,
          [{ x: pt.x[0], y: pt.y[0] }],
          colors[moving !== null ? 1 : 3]!,
        );
      }
      ctx.restore();
    },
    [
      evaluated.curves,
      evaluated.paths,
      hovering,
      headingCount,
      headingStyle,
      moving,
      shallow,
      colors,
      coordViz,
      pathStyle,
      showPathHeadings,
      movablePoints,
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
  const animationPath = useAtomValue(animationPathAtom);
  const animate = useCallback(
    (ctx: CanvasRenderingContext2D, _dpr: number) => {
      if (isUndefined(selectedPathOrCurveKey) || isUndefined(animationPath)) {
        return;
      }
      ctx.save();
      scaleCanvas(ctx);
      animateBot(
        ctx,
        selectedPathOrCurveKey,
        animationPath,
        animationStateRef.current,
        botStyle,
      );
      ctx.restore();
    },
    [selectedPathOrCurveKey, botStyle, animationPath],
  );
  // eslint-disable-next-line @eslint-react/exhaustive-deps
  useEffect(
    DebouncedDelay(() => {
      // This just resets the animation position.
      // I could make it calculate the animation path and update the state to
      // try to maintain animation, instead...
      animationStateRef.current.name = undefined;
    }, 250),
    [symbolTable],
  );

  return (
    <ResponsiveSquareCanvas
      anchor={{ x: 'left', y: 'top' }}
      render={renderField}
      animate={animate}
      onPointerDown={(_e, _p) => {
        if (hovering !== null) {
          setMoving(hovering);
        }
      }}
      onPointerMove={(e, p) => {
        const rp = unTransform(e, p);
        if (moving !== null) {
          // We're moving a point: Just move the point around...
          SetMovablePoint(symbolTable, setSymbolTable, moving, rp);
        } else if (movablePoints !== null && movablePoints.length >= 0) {
          // We're not moving a point, and we have some points we could
          // potentially try and move.
          // First, find the closest point:
          const mp = movablePoints.reduce(
            (prev: MovablePoint | undefined, cur: MovablePoint) => {
              if (isUndefined(prev)) {
                return cur;
              }
              const pdist = calcDist(rp, prev);
              const cdist = calcDist(rp, cur);
              return cdist < pdist ? cur : prev;
            },
            undefined,
          );
          if (isDefined(mp)) {
            // We found a 'close' point. Is it close enough?
            if (
              calcDist(rp, mp) < SELECTION_DISTANCE &&
              // Only move it if it's actually movied (don't flicker...as much)
              (hovering?.x[0] !== mp.x[0] || hovering?.y[0] !== mp.y[0])
            ) {
              // Close enough: Set it to the be the 'hovering' point
              setHovering(mp);
            } else if (
              hovering !== null &&
              calcDist(rp, mp) >= SELECTION_DISTANCE
            ) {
              // Not close enough: No 'hovering' point!
              setHovering(null);
            }
          }
        }
      }}
      onPointerUp={(_e, _p) => {
        if (moving !== null) {
          setMoving(null);
        }
        if (hovering !== null) {
          setHovering(null);
        }
      }}
    />
  );
}

function _drawFocusedPose(
  poseStyle: { Points: ControlPointStyle; Headings: HeadingStyle },
  ctx: CanvasRenderingContext2D,
  focusedPose: Point,
) {
  ctx.strokeStyle = tokens.colorNeutralForeground1; // TODO: Update this
  drawPoint(ctx, focusedPose, poseStyle.Points);
  ctx.stroke();
  if (isDefined(focusedPose.h)) {
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
      const avg: Point = {
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
  point: Point,
) {
  if (isUndefined(point.h)) {
    return;
  }
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineWidth = style.Thickness;
  ctx.strokeStyle = color;
  ctx.moveTo(point.x, point.y);
  const displacement = vector(point.h, style.Length);
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
  const xc = 72;
  const yc = 95;
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
