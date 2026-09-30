import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';

import {
  chkConstInterp,
  chkFacePtInterp,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkRef,
  chkTangentInterp,
  getInterpType,
  InterpNames,
  InterpRef,
} from './dto_schema';
import { PoseRefControl } from './PoseRefs';
import { namedValuesAtom } from './state';
import { ValRefControl } from './ValRefs';

export type InterpRefControlProps = {
  label: string;
  interp: InterpRef;
  onChange: (interp: InterpRef) => void;
};
export function InterpRefControl({
  label,
  interp,
  onChange,
}: InterpRefControlProps): ReactElement {
  const [namedValues] = useAtom(namedValuesAtom);
  const interpKeys = Object.keys(namedValues.interpolations || {});
  const valueKeys = Object.keys(namedValues.values || {});

  const currentType = getInterpType(interp);

  const handleTypeChange = (newType: InterpNames) => {
    switch (newType) {
      case 'Reference':
        onChange({ ref: interpKeys[0] || '' });
        break;
      case 'Constant':
        onChange({ heading: { val: 0 } });
        break;
      case 'Facing':
        onChange({
          point: {
            X: { val: 0 },
            Y: { val: 0 },
            Heading: { val: 0 },
            inRadians: false,
          },
        });
        break;
      case 'Linear':
        onChange({
          startHeading: { val: 0 },
          endHeading: { val: 180 },
          longWay: false,
        });
        break;
      case 'Tangent':
        onChange({ reversed: false });
        break;
      case 'PieceWise':
        onChange({
          pieces: [
            {
              until: { val: 0.5 },
              interpolator: { reversed: false },
            },
          ],
        });
        break;
    }
  };

  return (
    <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          {label}
        </label>
        <select
          value={currentType}
          onChange={(e) => handleTypeChange(e.target.value as InterpNames)}
          className="px-2.5 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sky-600 dark:text-sky-400 font-semibold outline-none focus:ring-2 focus:ring-sky-500">
          <option value="Constant">Constant (Fixed Heading)</option>
          <option value="Facing">Facing (Point at Pose)</option>
          <option value="Linear">Linear (Heading Range)</option>
          <option value="Tangent">Tangent (Along the Path)</option>
          <option value="PieceWise">Piecewise (Multi-Segment)</option>
          <option value="Reference">Reference (from Interpolations)</option>
        </select>
      </div>

      {chkRef(interp) && (
        <div className="space-y-2">
          <select
            value={interp?.ref || ''}
            onChange={(e) => onChange({ ref: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 outline-none">
            <option value="" disabled>
              Select Interpolator Reference...
            </option>
            {interpKeys.map((k) => (
              <option key={k} value={k}>
                {k} ({getInterpType(namedValues.interpolations?.[k]!)})
              </option>
            ))}
          </select>
        </div>
      )}

      {chkConstInterp(interp) && (
        <ValRefControl
          label="Heading Value"
          value={interp.heading || { val: 0 }}
          onChange={(heading) => onChange({ heading })}
        />
      )}

      {chkFacePtInterp(interp) && (
        <PoseRefControl
          label="Target Point Pose"
          pose={
            interp?.point || {
              X: { val: 0 },
              Y: { val: 0 },
              Heading: { val: 0 },
              inRadians: false,
            }
          }
          onChange={(point) => onChange({ point })}
        />
      )}

      {chkLinearInterp(interp) && (
        <div className="space-y-3">
          <ValRefControl
            label="Start Heading"
            value={interp.startHeading || { val: 0 }}
            onChange={(startHeading) => onChange({ ...interp, startHeading })}
          />
          <ValRefControl
            label="End Heading"
            value={interp?.endHeading || { val: 180 }}
            onChange={(endHeading) => onChange({ ...interp, endHeading })}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Take Long Way Arc
            </span>
            <input
              type="checkbox"
              checked={Boolean(interp?.longWay)}
              onChange={(e) =>
                onChange({ ...interp, longWay: e.target.checked })
              }
              className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      {chkTangentInterp(interp) && (
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Reversed Path Heading
          </span>
          <input
            type="checkbox"
            checked={Boolean(interp?.reversed)}
            onChange={(e) => onChange({ reversed: e.target.checked })}
            className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
          />
        </div>
      )}

      {chkPieceWiseInterp(interp) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Piecewise Interpolator Segments
            </span>
            <Button
              icon={<AddRegular />}
              onClick={() => {
                const pieces = interp?.pieces || [];
                onChange({
                  pieces: [
                    ...pieces,
                    { until: { val: 1.0 }, interpolator: { reversed: false } },
                  ],
                });
              }}>
              Add Piece
            </Button>
          </div>

          {(interp?.pieces || []).map((piece, idx) => (
            <div
              key={idx}
              className="p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  Piece #{idx + 1}
                </span>
                <Button
                  icon={<DeleteRegular />}
                  onClick={() => {
                    const newPieces = interp.pieces.filter((_, i) => i !== idx);
                    onChange({ pieces: newPieces });
                  }}
                  className="text-neutral-400 hover:text-rose-500 transition-colors"
                  title="Remove Piece"
                />
              </div>

              <ValRefControl
                label="Until Param (t)"
                value={piece.until}
                onChange={(until) => {
                  const newPieces = [...interp.pieces];
                  newPieces[idx] = { ...newPieces[idx], until };
                  onChange({ pieces: newPieces });
                }}
              />

              <InterpRefControl
                label="Segment Interpolator"
                interp={piece.interpolator}
                onChange={(interpolator) => {
                  const newPieces = [...interp.pieces];
                  newPieces[idx] = { ...newPieces[idx], interpolator };
                  onChange({ pieces: newPieces });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
