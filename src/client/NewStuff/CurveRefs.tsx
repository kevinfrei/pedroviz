import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';

import { chkRef, CurveRef, InterpRef } from './dto_schema';
import { InterpRefControl } from './InterpRefs';
import { PoseRefControl } from './PoseRefs';
import { namedValuesAtom } from './state';

export type CurveRefControlProps = {
  label: string;
  curve: CurveRef;
  onChange: (ncr: CurveRef) => void;
};
// CurveRef Control: Inline Curve vs Ref ({ ref })
export function CurveRefControl({
  label,
  curve,
  onChange,
}: CurveRefControlProps): ReactElement {
  const [namedValues] = useAtom(namedValuesAtom);
  const curveKeys = Object.keys(namedValues.curves || {});
  const isRef = chkRef(curve);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: curveKeys[0] || '' });
    } else {
      onChange({
        points: [
          {
            X: { val: 10 },
            Y: { val: 10 },
            Heading: { val: 0 },
            inRadians: false,
          },
          {
            X: { val: 20 },
            Y: { val: 20 },
            Heading: { val: 0 },
            inRadians: false,
          },
        ],
        interpolation: { reversed: false },
      });
    }
  };

  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded-md text-xs">
          <button
            type="button"
            onClick={() => setToRef(false)}
            className={`px-2 py-0.5 rounded ${
              !isRef
                ? 'bg-white dark:bg-neutral-700 text-sky-600 dark:text-sky-400 font-medium shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}>
            Inline Curve
          </button>
          <button
            type="button"
            onClick={() => setToRef(true)}
            className={`px-2 py-0.5 rounded ${
              isRef
                ? 'bg-white dark:bg-neutral-700 text-sky-600 dark:text-sky-400 font-medium shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}>
            Reference
          </button>
        </div>
      </div>

      {isRef ? (
        <select
          value={chkRef(curve) ? curve.ref : ''}
          onChange={(e) => onChange({ ref: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 outline-none">
          <option value="" disabled>
            Select Curve Reference...
          </option>
          {curveKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Curve Points (Poses)
              </span>
              <Button
                icon={<AddRegular />}
                onClick={() => {
                  const pts = curve?.points || [];
                  onChange({
                    ...curve,
                    points: [
                      ...pts,
                      {
                        X: { val: 0 },
                        Y: { val: 0 },
                        Heading: { val: 0 },
                        inRadians: false,
                      },
                    ],
                  });
                }}>
                Add Pose
              </Button>
            </div>

            {(curve?.points || []).map((pt, pIdx) => (
              <div key={pIdx} className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-500">
                    Pose #{pIdx + 1}
                  </span>
                  {(curve?.points || []).length > 1 && (
                    <Button
                      icon={<DeleteRegular />}

                      onClick={() => {
                        const newPts = curve.points.filter(
                          (_, i) => i !== pIdx,
                        );
                        onChange({ ...curve, points: newPts });
                      }}
                      title="Remove Pose Point"
                    />
                  )}
                </div>
                <PoseRefControl
                  label={`Point ${pIdx + 1}`}
                  pose={pt}
                  onChange={(newPt) => {
                    const newPts = [...curve.points];
                    newPts[pIdx] = newPt;
                    onChange({ ...curve, points: newPts });
                  }}
                />
              </div>
            ))}
          </div>

          <InterpRefControl
            label="Curve Interpolator"
            interp={curve?.interpolation || { reversed: false }}
            onChange={(interpolation: InterpRef) =>
              onChange({ ...curve, interpolation })
            }
          />
        </div>
      )}
    </div>
  );
}
