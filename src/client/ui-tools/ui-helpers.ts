// SPDX-License-Identifier: AGPL-3.0-or-later

import { MovablePoint, Point } from '../EvalTypes';

export function calcDist(pt: Point, mp: MovablePoint): number {
  const mx = mp.x[0];
  const my = mp.y[0];
  const dx = mx - pt.x;
  const dy = my - pt.y;
  return dx * dx + dy * dy;
}
