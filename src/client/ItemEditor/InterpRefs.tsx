import React, { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button, Checkbox, Select } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { hasField } from '@freik/typechk';

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
} from '../dto_schema';
import {
  symbolTableAtom,
  symbolTableInterpolationsAtom,
} from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { PoseRefControl } from './PoseRefs';
import { ValRefControl } from './ValRefs';

export type InterpRefControlPropsWithShow = {
  label: string;
  interp?: InterpRef;
  showNone: true;
  onChange: (interp: InterpRef | null) => void;
};
export type InterpRefControlPropsNoShow = {
  label: string;
  interp: InterpRef;
  onChange: (interp: InterpRef) => void;
};
export function InterpRefControl(
  props: InterpRefControlPropsWithShow | InterpRefControlPropsNoShow,
): ReactElement {
  const { label, interp, onChange } = props;
  const showNone = hasField(props, 'showNone') ? props.showNone : false;
  const symbolTable = useAtomValue(symbolTableAtom);
  const interpolations = useAtomValue(symbolTableInterpolationsAtom);
  const interpKeys = Array.from(interpolations.keys());

  const currentType = !interp ? 'None' : getInterpType(interp);

  const handleTypeChange = (newType: InterpNames | 'Reference' | 'None') => {
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
      case 'None':
        // Type system annoyance...
        onChange(null as unknown as InterpRef);
        break;
    }
  };

  return (
    <TitleWrapper title={label}>
      <>
        <Select
          value={currentType}
          onChange={(e, d) => handleTypeChange(d.value as InterpNames)}>
          {showNone && <option value="None">None</option>}
          <option value="Reference">Reference (from Interpolations)</option>
          <option value="Tangent">Tangent (Along the Path)</option>
          <option value="Constant">Constant (Fixed Heading)</option>
          <option value="Linear">Linear (Heading Range)</option>
          <option value="Facing">Facing (Point at Pose)</option>
          <option value="PieceWise">Piecewise (Multi-Segment)</option>
        </Select>

        {chkRef(interp) && (
          <span>
            <Select
              value={interp?.ref || ''}
              onChange={(e) => onChange({ ref: e.target.value })}>
              <option key="$" value="" disabled>
                Select Interpolator Reference...
              </option>
              {interpKeys.map((k) => (
                <option key={k} value={k}>
                  {k} ({getInterpType(symbolTable.interpolations.get(k)!)})
                </option>
              ))}
            </Select>
          </span>
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
          <div>
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
            <Checkbox
              label="Turn the 'long way'"
              checked={interp?.longWay}
              onChange={(_, d) =>
                onChange({ ...interp, longWay: d.checked === true })
              }
            />
          </div>
        )}

        {chkTangentInterp(interp) && (
          <Checkbox
            label="Face the opposite direction of the path"
            checked={Boolean(interp?.reversed)}
            onChange={(_, d) => onChange({ reversed: d.checked === true })}
          />
        )}

        {chkPieceWiseInterp(interp) && (
          <div>
            <div>
              <span>Piecewise Interpolator Segments</span>
              <Button
                icon={<AddRegular />}
                onClick={() => {
                  const pieces = interp?.pieces || [];
                  onChange({
                    pieces: [
                      ...pieces,
                      {
                        until: { val: 1.0 },
                        interpolator: { reversed: false },
                      },
                    ],
                  });
                }}>
                Add Piece
              </Button>
            </div>

            {(interp?.pieces || []).map((piece, idx) => (
              <div key={idx}>
                <div>
                  <span>Piece #{idx + 1}</span>
                  <Button
                    icon={<DeleteRegular />}
                    onClick={() => {
                      const newPieces = interp.pieces.filter(
                        (_, i) => i !== idx,
                      );
                      onChange({ pieces: newPieces });
                    }}
                    title="Remove Piece"
                  />
                </div>

                <ValRefControl
                  label="Until (% of path complete)"
                  value={piece.until}
                  onChange={(until) => {
                    const newPieces = [...interp.pieces];
                    newPieces[idx] = { ...piece, until };
                    onChange({ pieces: newPieces });
                  }}
                />

                <InterpRefControl
                  label="Segment Interpolator"
                  interp={piece.interpolator}
                  onChange={(interpolator: InterpRef) => {
                    const newPieces = [...interp.pieces];
                    newPieces[idx] = { ...piece, interpolator };
                    onChange({ pieces: newPieces });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </>
    </TitleWrapper>
  );
}
