// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Button, Checkbox, Select, Text } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { hasField, isError, isUndefined } from '@freik/typechk';

import {
  chkConstInterp,
  chkFacePtInterp,
  chkLinearInterp,
  chkPieceWiseInterp,
  chkRef,
  chkTangentInterp,
  getInterpType,
} from '../../DataTypeChecks';
import {
  HeadingVal,
  InterpNames,
  InterpRef,
  SymbolTable,
} from '../../DataTypes';
import { resolveInterpRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { HeadingRefEditor } from './HeadingRefEditor';
import { PoseRefEditor } from './PoseRefEditor';
import { ValRefEditor } from './ValRefEditor';

const zeroHeading: HeadingVal = { angle: { val: 0 }, inRadians: false };
const one80Heading: HeadingVal = { angle: { val: 180 }, inRadians: false };

// TODO: Make this much better
export function SimpleInterpRef({
  interpref,
}: {
  interpref: InterpRef | undefined;
}): ReactElement {
  if (isUndefined(interpref)) {
    return <></>;
  }
  if (chkRef(interpref)) {
    return (
      <Text>
        Named Interpolator <code>{interpref.ref}</code>
      </Text>
    );
  }
  return <Text>{getInterpType(interpref)}</Text>;
}

// Filter out interpolation names that would result in errors
function validInterpsForRef(
  interpKeys: string[],
  symbolTable: SymbolTable,
  name?: string,
): string[] {
  if (!name) {
    return interpKeys;
  }
  return interpKeys.filter(
    (k) => !isError(resolveInterpRef({ ref: k }, symbolTable, new Set([name]))),
  );
}

export type InterpRefEditorPropsWithShow = {
  label: string;
  item?: InterpRef;
  showNone: true;
  name?: string;
  onChange: (interp: InterpRef | null) => void;
};
export type InterpRefEditorPropsNoShow = {
  label: string;
  item: InterpRef;
  name?: string;
  onChange: (interp: InterpRef) => void;
};
export function InterpRefEditor(
  props: InterpRefEditorPropsWithShow | InterpRefEditorPropsNoShow,
): ReactElement {
  const { label, item, onChange } = props;
  const showNone = hasField(props, 'showNone') ? props.showNone : false;
  const symbolTable = useAtomValue(symbolTableAtom);
  const interpolations = symbolTable.interpolations;
  const interpKeys = validInterpsForRef(
    Array.from(interpolations.keys()),
    symbolTable,
    props.name,
  );

  const currentType = !item ? 'None' : getInterpType(item);

  const handleTypeChange = (newType: InterpNames | 'Reference' | 'None') => {
    switch (newType) {
      case 'Reference':
        onChange({ ref: interpKeys[0] || '' });
        break;
      case 'Constant':
        onChange({ heading: zeroHeading });
        break;
      case 'Facing':
        onChange({
          point: {
            X: { val: 0 },
            Y: { val: 0 },
            heading: zeroHeading,
          },
        });
        break;
      case 'Linear':
        onChange({
          start: zeroHeading,
          end: one80Heading,
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

        {chkConstInterp(item) && (
          <HeadingRefEditor
            label="Heading Value"
            item={item.heading || { angle: { val: 0 }, inRadians: false }}
            onChange={(hr) => onChange({ heading: hr })}
          />
        )}

        {chkFacePtInterp(item) && (
          <PoseRefEditor
            label="Target Point Pose"
            item={
              item?.point || {
                X: { val: 0 },
                Y: { val: 0 },
                heading: zeroHeading,
                inRadians: false,
              }
            }
            onChange={(point) => onChange({ point })}
          />
        )}

        {chkLinearInterp(item) && (
          <div>
            <HeadingRefEditor
              label="Start Heading"
              item={item.start || zeroHeading}
              onChange={(start) => onChange({ ...item, start })}
            />
            <HeadingRefEditor
              label="End Heading"
              item={item?.end || one80Heading}
              onChange={(end) => onChange({ ...item, end })}
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

                <ValRefEditor
                  label="Until (% of path complete)"
                  item={piece.until}
                  onChange={(until) => {
                    const newPieces = [...item.pieces];
                    newPieces[idx] = { ...piece, until };
                    onChange({ pieces: newPieces });
                  }}
                />

                <InterpRefEditor
                  label="Segment Interpolator"
                  item={piece.interpolator}
                  name={props.name}
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
