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
  ConstInterp,
  FacePtInterp,
  getInterpType,
  HeadingRef,
  HeadingVal,
  InterpNames,
  InterpRef,
  LinearInterp,
  mkConstInterp,
  mkFacingInterp,
  mkHeading,
  mkLinearInterp,
  mkNewHeading,
  mkNewPose,
  mkPiece,
  mkPiecewise,
  mkRef,
  mkTangentInterp,
  mkValue,
  PieceWiseInterp,
  SymbolTable,
  TangentInterp,
} from '../../dataTypes';
import { resolveInterpRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { HeadingRefEditor } from './HeadingRefEditor';
import { PoseRefEditor } from './PoseRefEditor';
import { ValRefEditor } from './ValRefEditor';

const zeroHeading: HeadingVal = mkHeading(mkValue(0));

// TODO: Make this much better
export function SimpleInterpRef({
  interpref,
}: {
  interpref: InterpRef | undefined;
}): ReactElement {
  if (isUndefined(interpref)) {
    return <></>;
  } else if (chkRef(interpref)) {
    return <code>"{interpref.ref}"</code>;
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
    (k) => !isError(resolveInterpRef(mkRef(k), symbolTable, new Set([name]))),
  );
}

export type InterpRefEditorPropsWithShow = {
  label: string;
  item?: InterpRef;
  showNone: true;
  name?: string;
  topLevel?: boolean;
  onChange: (interp: InterpRef | null) => void;
};
export type InterpRefEditorPropsNoShow = {
  label: string;
  item: InterpRef;
  name?: string;
  topLevel?: boolean;
  onChange: (interp: InterpRef) => void;
};
export function InterpRefEditor(
  props: InterpRefEditorPropsWithShow | InterpRefEditorPropsNoShow,
): ReactElement {
  const { label, item, onChange, topLevel } = props;
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
        onChange(mkRef(interpKeys[0] || ''));
        break;
      case 'Constant':
        onChange(mkConstInterp(zeroHeading));
        break;
      case 'Facing':
        onChange(mkFacingInterp(mkNewPose(false)));
        break;
      case 'Linear':
        onChange(mkLinearInterp(mkNewHeading(), mkNewHeading()));
        break;
      case 'Tangent':
        onChange(mkTangentInterp());
        break;
      case 'PieceWise':
        onChange(mkPiecewise(mkPiece(mkValue(1.0), mkTangentInterp())));
        break;
      case 'None':
        // Type system annoyance...
        onChange(null as unknown as InterpRef);
        break;
    }
  };

  return (
    <TitleWrapper title={label} expandable={!topLevel}>
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
          <Select
            value={item?.ref || ''}
            onChange={(e) => onChange(mkRef(e.target.value))}>
            <option key="$" value="" disabled>
              Select Interpolator Reference...
            </option>
            {interpKeys.map((k) => (
              <option key={k} value={k}>
                {k} ({getInterpType(symbolTable.interpolations.get(k)!)})
              </option>
            ))}
          </Select>
        )}

        {chkTangentInterp(item) && (
          <TangentInterpEditor item={item} onChange={onChange} />
        )}

        {chkConstInterp(item) && (
          <ConstantInterpEditor item={item} onChange={onChange} />
        )}

        {chkFacePtInterp(item) && (
          <FacingPointInterpEditor item={item} onChange={onChange} />
        )}

        {chkLinearInterp(item) && (
          <LinearInterpEditor item={item} onChange={onChange} />
        )}

        {chkPieceWiseInterp(item) && (
          <PieceWiseInterpEditor
            item={item}
            onChange={onChange}
            name={props.name}
          />
        )}
      </>
    </TitleWrapper>
  );
}

type InterpEditorProps<T> = {
  item: T;
  onChange:
    ((interp: InterpRef) => void) | ((interp: InterpRef | null) => void);
};

function PieceWiseInterpEditor({
  item,
  onChange,
  name,
}: InterpEditorProps<PieceWiseInterp> & { name?: string }): ReactElement {
  return (
    <div>
      <Button
        appearance="primary"
        style={{ marginTop: '5px' }}
        icon={<AddRegular />}
        onClick={() => {
          const pieces = item?.pieces || [];
          onChange(
            mkPiecewise(...pieces, mkPiece(mkValue(1.0), mkTangentInterp())),
          );
        }}>
        Add Piece
      </Button>
      {(item?.pieces || []).map((piece, idx) => (
        <TitleWrapper
          key={idx}
          title={
            <>
              <span>Piece #{idx + 1}</span>
              <Button
                title="Remove Piece"
                appearance="transparent"
                style={{
                  marginLeft: '3px',
                  marginTop: '-3px',
                  marginRight: '-5px',
                }}
                icon={<DeleteRegular />}
                disabled={item.pieces.length === 1}
                onClick={() => {
                  onChange(
                    mkPiecewise(...item.pieces.filter((_, i) => i !== idx)),
                  );
                }}
              />
            </>
          }>
          <>
            <ValRefEditor
              label="Until (fraction of path complete)"
              item={piece.until}
              onChange={(until) => {
                const newPieces = [...item.pieces];
                newPieces[idx] = mkPiece(until, piece.interpolator);
                onChange(mkPiecewise(...newPieces));
              }}
            />

            <InterpRefEditor
              label="Segment Interpolator"
              item={piece.interpolator}
              name={name}
              onChange={(interpolator: InterpRef) => {
                const newPieces = [...item.pieces];
                newPieces[idx] = mkPiece(piece.until, interpolator);
                onChange(mkPiecewise(...newPieces));
              }}
            />
          </>
        </TitleWrapper>
      ))}
    </div>
  );
}

function LinearInterpEditor({
  item,
  onChange,
}: InterpEditorProps<LinearInterp>): ReactElement {
  return (
    <div>
      <HeadingRefEditor
        label="Start Heading"
        item={item.start || mkNewHeading()}
        onChange={(start: HeadingRef) =>
          onChange(mkLinearInterp(start, item.end, item.longWay))
        }
      />
      <HeadingRefEditor
        label="End Heading"
        item={item?.end || mkNewHeading()}
        onChange={(end: HeadingRef) =>
          onChange(mkLinearInterp(item.start, end, item.longWay))
        }
      />
      <Checkbox
        label="Turn the 'long way'"
        checked={item?.longWay}
        onChange={(_, d) =>
          onChange(mkLinearInterp(item.start, item.end, d.checked === true))
        }
      />
    </div>
  );
}

function FacingPointInterpEditor({
  item,
  onChange,
}: InterpEditorProps<FacePtInterp>): ReactElement {
  return (
    <PoseRefEditor
      label="Target Point Pose"
      item={item?.point || mkNewPose(false)}
      heading={false}
      onChange={(point) => onChange(mkFacingInterp(point))}
    />
  );
}

function TangentInterpEditor({
  item,
  onChange,
}: InterpEditorProps<TangentInterp>): ReactElement {
  return (
    <Checkbox
      label="Face the opposite direction of the path"
      checked={Boolean(item?.reversed)}
      onChange={(_, d) => onChange(mkTangentInterp(d.checked === true))}
    />
  );
}

function ConstantInterpEditor({
  item,
  onChange,
}: InterpEditorProps<ConstInterp>): ReactElement {
  return (
    <HeadingRefEditor
      label="Heading Value"
      item={item.heading || mkNewHeading()}
      onChange={(hr: HeadingRef) => onChange(mkConstInterp(hr))}
    />
  );
}
