import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  Button,
  Field,
  Radio,
  RadioGroup,
  Select,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';

import { chkRef, CurveRef, InterpRef } from './dto_schema';
import { InterpRefControl } from './InterpRefs';
import { PoseRefControl } from './PoseRefs';
import { namedValuesAtom } from './state';
import { useWrappedRegionStyle } from './WrappedRegionStyle';

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
  const wrappedStyle = useWrappedRegionStyle();
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
    <div className={wrappedStyle.wrapper}>
      <Field
        className={wrappedStyle.field}
        label={<span className={wrappedStyle.label}>{label}</span>}>
        <RadioGroup
          value={isRef ? 'ref' : 'val'}
          layout="horizontal"
          onChange={(_, data) => {
            setToRef(data.value === 'ref');
          }}>
          <Radio value="val" label="Inline Curve" />
          <Radio value="ref" label="Reference" />
        </RadioGroup>
      </Field>

      {isRef ? (
        <Select
          value={chkRef(curve) ? curve.ref : ''}
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Toolbar>
              <Text>Curve Points (Poses)</Text>
              <ToolbarButton
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
              </ToolbarButton>
            </Toolbar>

            {(curve?.points || []).map((pt, pIdx) => (
              <div key={pIdx} className="relative pt-1">
                <div>
                  <span>Pose #{pIdx + 1}</span>
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
