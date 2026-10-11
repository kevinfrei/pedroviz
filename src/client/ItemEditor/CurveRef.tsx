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

import { chkRef } from '../../DataTypeChecks';
import { CurveRef, InterpRef } from '../../DataTypes';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { InterpRefControl } from './InterpRef';
import { PoseRefControl } from './PoseRef';

export type CurveRefControlProps = {
  label: string;
  item: CurveRef;
  onChange: (ncr: CurveRef) => void;
};
// CurveRef Control: Inline Curve vs Ref ({ ref })
export function CurveRefControl({
  label,
  item,
  onChange,
}: CurveRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const curveKeys = Array.from(symbolTable.curves.keys());
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
                  <PoseRefControl
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

            <InterpRefControl
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
