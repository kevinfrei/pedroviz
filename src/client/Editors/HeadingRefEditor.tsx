// SPDX-License-Identifier: AGPL-3.0-or-later

import { Fragment, ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  SpinButton,
  Text,
} from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { hasField, isDefined, isError } from '@freik/typechk';

import {
  chkErr,
  HeadingRef,
  mkHeading,
  mkNewHeading,
  mkRef,
  mkValue,
  Ref,
  SymbolTable,
} from '../../dataTypes';
import { resolveHeadingRef, resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { useSpinButtonChange } from '../ui-tools/ControlledSpinButton';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import {
  getHeadingType,
  HeadingType,
  hrIsPose,
  hrIsRef,
  hrIsVal,
} from './EditorTypes';
import { SimplePoseRef, SimpleValRef } from './Viewers';

// Filter out pose names that would result in errors
function validPosesForRef(
  poseKeys: string[],
  symbolTable: SymbolTable,
): string[] {
  return poseKeys.filter((k) => {
    const resolved = resolvePoseRef(mkRef(k), symbolTable);
    return (
      !isError(resolved) &&
      isDefined(resolved.heading) &&
      !isError(resolved.heading)
    );
  });
}

type HeadingRefEditorNullableProps = {
  label: string;
  item: HeadingRef | null;
  onChange: (headingRef: HeadingRef | null) => void;
  optional: true;
};

type HeadingRefEditorNonnullableProps = {
  label: string;
  item: HeadingRef | null;
  onChange: (headingRef: HeadingRef) => void;
};

type HeadingRefEditorProps =
  HeadingRefEditorNonnullableProps | HeadingRefEditorNullableProps;

// HeadingRef Control: Switch between Inline ({ angle: ValRef, inRadians: Boolean }) and PoseRef ({ ref })
// This is intentionally not allowing inline poses. I think that's probably silly/unnecessary anyway.
export function HeadingRefEditor(props: HeadingRefEditorProps): ReactElement {
  const headingOptional = hasField(props, 'optional') && props.optional;
  const { item, label, onChange } = props;
  const symbolTable = useAtomValue(symbolTableAtom);
  const valueKeys = [...symbolTable.values.keys()];
  const validPoseKeys = validPosesForRef(
    [...symbolTable.poses.keys()],
    symbolTable,
  );
  const headingType = getHeadingType(item);
  const resolved = item === null ? null : resolveHeadingRef(item, symbolTable);
  const onSpinChange = useSpinButtonChange((val) =>
    onChange(
      mkHeading(
        mkValue(val),
        hasField(item, 'inRadians') ? item.inRadians : false,
      ),
    ),
  );
  const setType = (type: HeadingType) => {
    switch (type) {
      case 'pose': {
        const poseKey = validPoseKeys[0] || '';
        onChange(mkRef(poseKey));
        break;
      }
      case 'ref': {
        const valKey = valueKeys[0] || '';
        onChange(mkHeading(mkRef(valKey)));
        break;
      }
      case 'val': {
        onChange(mkNewHeading());
        break;
      }
      case 'none': {
        onChange(null!);
        break;
      }
    }
  };
  const chooser = headingOptional ? (
    <Select
      value={headingType}
      onChange={(_, d) => setType(d.value as HeadingType)}>
      <option value="none">No Heading</option>
      <option value="val">Value</option>
      <option value="ref">Named Value</option>
      <option value="pose">Named Pose</option>
    </Select>
  ) : (
    <RadioGroup
      value={headingType}
      onChange={(_, data) => {
        setType(data.value as HeadingType);
      }}>
      <Radio value="val" label="Value" />
      <Radio value="ref" label="Named Value" />
      <Radio value="pose" label="Named Pose" />
    </RadioGroup>
  );
  return (
    <TitleWrapper title={label} expandable>
      {chooser}
      {hrIsPose(item) && (
        // Pose Reference
        <>
          <span>
            <Select
              value={item.ref}
              onChange={(e, d) => onChange(mkRef(d.value))}>
              <option key="$" value="" disabled>
                Select Pose Reference...
              </option>
              {validPoseKeys.map((k) => (
                <option key={k} value={k}>
                  {k}{' '}
                  <SimplePoseRef
                    onlyHeading
                    poseref={symbolTable.poses.get(k)}
                  />
                </option>
              ))}
            </Select>
          </span>
          {chkErr(resolved) && (
            <Text>
              <AlertFilled />
              {resolved.errors().map((e) => (
                <Fragment key={e}>
                  <Text>{e}</Text>
                  <br />
                </Fragment>
              ))}
              for {item.ref}
            </Text>
          )}
        </>
      )}
      {!hrIsPose(item) && !!item && (
        <>
          {hrIsVal(item) && (
            // Numeric Angle value
            <SpinButton
              precision={3}
              step={1}
              stepPage={10}
              value={item.angle.val}
              onChange={onSpinChange}
            />
          )}
          {hrIsRef(item) && (
            // Angle Value *reference*
            <Select
              value={(item.angle as Ref).ref}
              onChange={(_, d) =>
                onChange(mkHeading(mkRef(d.value), item.inRadians))
              }>
              <option key="$" value="" disabled>
                Select Value Reference...
              </option>
              {valueKeys.map((k) => (
                <option key={k} value={k}>
                  {k} <SimpleValRef valref={symbolTable.values.get(k)} />
                </option>
              ))}
            </Select>
          )}
          <br />
          <Checkbox
            checked={item.inRadians}
            onChange={(e) => onChange(mkHeading(item.angle, e.target.checked))}
            label="Heading Angle in Radians?"
          />
        </>
      )}
    </TitleWrapper>
  );
}
