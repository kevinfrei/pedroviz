// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  Button,
  Radio,
  RadioGroup,
  Select,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { isError } from '@freik/typechk';

import { chkRef, CurveRef, InterpRef, SymbolTable } from '../../dataTypes';
import { resolveCurveRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { InterpRefEditor } from './InterpRefEditor';
import { PoseRefEditor } from './PoseRefEditor';

// Filter out interpolation names that would result in errors
function validCurvesForRef(
  curveKeys: string[],
  symbolTable: SymbolTable,
  name?: string,
): string[] {
  if (!name) {
    return curveKeys;
  }
  return curveKeys.filter(
    (k) =>
      k !== name &&
      !isError(resolveCurveRef({ ref: k }, symbolTable, new Set([name]))),
  );
}

export type CurveRefEditorProps = {
  label: string | ReactElement;
  item: CurveRef;
  name?: string;
  topLevel?: boolean;
  onChange: (ncr: CurveRef) => void;
};
// CurveRef Control: Inline Curve vs Ref ({ ref })
export function CurveRefEditor({
  label,
  item,
  name,
  topLevel,
  onChange,
}: CurveRefEditorProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const curveKeys = validCurvesForRef(
    Array.from(symbolTable.curves.keys()),
    symbolTable,
    name,
  );
  const isRef = chkRef(item);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: curveKeys[0] || '' });
    } else {
      onChange({
        points: [
          {
            X: { val: 10 },
            Y: { val: 10 },
            heading: { angle: { val: 0 }, inRadians: false },
          },
          {
            X: { val: 20 },
            Y: { val: 20 },
            heading: { angle: { val: 0 }, inRadians: false },
          },
        ],
        interpolation: { reversed: false },
      });
    }
  };

  return (
    <TitleWrapper title={label} expandable={!topLevel}>
      <>
        <RadioGroup
          value={isRef ? 'ref' : 'val'}
          layout="horizontal"
          onChange={(_, data) => {
            setToRef(data.value === 'ref');
          }}>
          <Radio value="val" label="Inline Curve" />
          <Radio value="ref" label="Reference" />
        </RadioGroup>

        {isRef ? (
          <Select
            value={chkRef(item) ? item.ref : ''}
            onChange={(e) => onChange({ ref: e.target.value })}>
            <option key="$" value="" disabled>
              Select Curve Reference...
            </option>
            {curveKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        ) : (
          <div>
            <div>
              <Toolbar>
                <ToolbarButton
                  icon={<AddRegular />}
                  onClick={() => {
                    const pts = item?.points || [];
                    onChange({
                      ...item,
                      points: [
                        ...pts,
                        {
                          X: { val: 62 + Math.random() * 20 },
                          Y: { val: 62 + Math.random() * 20 },
                          heading: { angle: { val: 0 }, inRadians: false },
                        },
                      ],
                    });
                  }}>
                  Add Control Point
                </ToolbarButton>
              </Toolbar>
              {(item?.points || []).map((pt, pIdx) => (
                <PoseRefEditor
                  key={pIdx}
                  heading={false}
                  label={
                    <>
                      <Text weight="bold">Control Point #{pIdx + 1}</Text>
                      {(item?.points || []).length > 2 && (
                        <Button
                          title="Remove Pose Point"
                          appearance="transparent"
                          style={{
                            marginLeft: '3px',
                            marginTop: '-3px',
                            marginRight: '-5px',
                          }}
                          icon={<DeleteRegular />}
                          onClick={() => {
                            const newPts = item.points.filter(
                              (_, i) => i !== pIdx,
                            );
                            onChange({ ...item, points: newPts });
                          }}
                        />
                      )}
                    </>
                  }
                  item={pt}
                  onChange={(newPt) => {
                    const newPts = [...item.points];
                    newPts[pIdx] = newPt;
                    onChange({ ...item, points: newPts });
                  }}
                />
              ))}
            </div>
            <InterpRefEditor
              label="Curve Interpolator"
              item={item?.interpolation || { reversed: false }}
              onChange={(interpolation: InterpRef) =>
                onChange({ ...item, interpolation })
              }
            />
          </div>
        )}
      </>
    </TitleWrapper>
  );
}
