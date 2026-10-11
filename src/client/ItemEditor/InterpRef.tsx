// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Button, Checkbox, Select } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { hasField } from '@freik/typechk';

import {
  chkConstInterp,
  chkFacePtInterp,
  chkHeadingVal,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkRef,
  chkTangentInterp,
  getInterpType,
} from '../../DataTypeChecks';
import { InterpNames, InterpRef } from '../../DataTypes';
import {
  symbolTableAtom,
  symbolTableInterpolationsAtom,
} from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { PoseRefControl } from './PoseRef';
import { ValRefControl } from './ValRef';

export type InterpRefControlPropsWithShow = {
  label: string;
  item?: InterpRef;
  showNone: true;
  onChange: (interp: InterpRef | null) => void;
};
export type InterpRefControlPropsNoShow = {
  label: string;
  item: InterpRef;
  onChange: (interp: InterpRef) => void;
};
export function InterpRefControl(
  props: InterpRefControlPropsWithShow | InterpRefControlPropsNoShow,
): ReactElement {
  const { label, item, onChange } = props;
  const showNone = hasField(props, 'showNone') ? props.showNone : false;
  const symbolTable = useAtomValue(symbolTableAtom);
  const interpolations = useAtomValue(symbolTableInterpolationsAtom);
  const interpKeys = Array.from(interpolations.keys());

  const currentType = !item ? 'None' : getInterpType(item);

  const handleTypeChange = (newType: InterpNames | 'Reference' | 'None') => {
    switch (newType) {
      case 'Reference':
        onChange({ ref: interpKeys[0] || '' });
        break;
      case 'Constant':
        onChange({ heading: { val: 0 }, inRadians: true });
        break;
      case 'Facing':
        onChange({
          point: {
            X: { val: 0 },
            Y: { val: 0 },
            heading: { heading: { val: 0 }, inRadians: false },
          },
        });
        break;
      case 'Linear':
        onChange({
          start: { heading: { val: 0 }, inRadians: true },
          end: { heading: { val: 180 }, inRadians: false },
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

        {chkRef(item) && (
          <span>
            <Select
              value={item?.ref || ''}
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

        {chkConstInterp(item) &&
          (chkHeadingVal(item) ? (
            <ValRefControl
              label="Heading Value"
              item={item.heading || { val: 0 }}
              onChange={(heading) => onChange({ heading })}
            />
          ) : (
            <PoseRefControl
              label="Heading Value"
              item={
                item.heading || {
                  X: 0,
                  Y: 0,
                  heading: { val: 0 },
                  inRadians: false,
                }
              }
              onChange={(poseRef) => onChange({ heading: poseRef })}
            />
          ))}

        {chkFacePtInterp(item) && (
          <PoseRefControl
            label="Target Point Pose"
            item={
              item?.point || {
                X: { val: 0 },
                Y: { val: 0 },
                heading: { val: 0 },
                inRadians: false,
              }
            }
            onChange={(point) => onChange({ point })}
          />
        )}

        {chkLinearInterp(item) && (
          <div>
            <ValRefControl
              label="Start Heading"
              item={item.start || { val: 0 }}
              onChange={(startHeading) => onChange({ ...item, startHeading })}
            />
            <ValRefControl
              label="End Heading"
              item={item?.end || { val: 180 }}
              onChange={(endHeading) => onChange({ ...item, endHeading })}
            />
            <Checkbox
              label="Turn the 'long way'"
              checked={item?.longWay}
              onChange={(_, d) =>
                onChange({ ...item, longWay: d.checked === true })
              }
            />
          </div>
        )}

        {chkTangentInterp(item) && (
          <Checkbox
            label="Face the opposite direction of the path"
            checked={Boolean(item?.reversed)}
            onChange={(_, d) => onChange({ reversed: d.checked === true })}
          />
        )}

        {chkPieceWiseInterp(item) && (
          <div>
            <div>
              <span>Piecewise Interpolator Segments</span>
              <Button
                icon={<AddRegular />}
                onClick={() => {
                  const pieces = item?.pieces || [];
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

            {(item?.pieces || []).map((piece, idx) => (
              <div key={idx}>
                <div>
                  <span>Piece #{idx + 1}</span>
                  <Button
                    icon={<DeleteRegular />}
                    onClick={() => {
                      const newPieces = item.pieces.filter((_, i) => i !== idx);
                      onChange({ pieces: newPieces });
                    }}
                    title="Remove Piece"
                  />
                </div>

                <ValRefControl
                  label="Until (% of path complete)"
                  item={piece.until}
                  onChange={(until) => {
                    const newPieces = [...item.pieces];
                    newPieces[idx] = { ...piece, until };
                    onChange({ pieces: newPieces });
                  }}
                />

                <InterpRefControl
                  label="Segment Interpolator"
                  item={piece.interpolator}
                  onChange={(interpolator: InterpRef) => {
                    const newPieces = [...item.pieces];
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
