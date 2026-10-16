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

import { chkRef } from '../../DataTypeChecks';
import { CurveRef, InterpRef, SymbolTable } from '../../DataTypes';
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
  label: string;
  item: CurveRef;
  name?: string;
  onChange: (ncr: CurveRef) => void;
};
// CurveRef Control: Inline Curve vs Ref ({ ref })
export function CurveRefEditor({
  label,
  item,
  name,
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
    <TitleWrapper title={label}>
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
                <Text>Curve Points (Poses)</Text>
                <ToolbarButton
                  icon={<AddRegular />}
                  onClick={() => {
                    const pts = item?.points || [];
                    onChange({
                      ...item,
                      points: [
                        ...pts,
                        {
                          X: { val: 0 },
                          Y: { val: 0 },
                          heading: { angle: { val: 0 }, inRadians: false },
                        },
                      ],
                    });
                  }}>
                  Add Pose
                </ToolbarButton>
              </Toolbar>

              {(item?.points || []).map((pt, pIdx) => (
                <div key={pIdx}>
                  <div>
                    <span>Pose #{pIdx + 1}</span>
                    {(item?.points || []).length > 1 && (
                      <Button
                        icon={<DeleteRegular />}

                        onClick={() => {
                          const newPts = item.points.filter(
                            (_, i) => i !== pIdx,
                          );
                          onChange({ ...item, points: newPts });
                        }}
                        title="Remove Pose Point"
                      />
                    )}
                  </div>
                  <PoseRefEditor
                    label={`Point ${pIdx + 1}`}
                    item={pt}
                    onChange={(newPt) => {
                      const newPts = [...item.points];
                      newPts[pIdx] = newPt;
                      onChange({ ...item, points: newPts });
                    }}
                  />
                </div>
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
