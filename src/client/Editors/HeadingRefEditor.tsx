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
import {
  chkObjectOfExactType,
  hasField,
  isBoolean,
  isDefined,
  isError,
  isNull,
  isUndefined,
  typecheck,
} from '@freik/typechk';

import {
  chkErr,
  chkRef,
  chkValue,
  HeadingRef,
  Ref,
  SymbolTable,
  Value,
} from '../../dataTypes';
import { ResolvedHeading } from '../ResolvedTypes';
import { resolveHeadingRef, resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { useSpinButtonChange } from '../ui-tools/ControlledSpinButton';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { SimplePoseRef } from './PoseRefEditor';
import { SimpleValRef } from './ValRefEditor';

// Filter out pose names that would result in errors
function validPosesForRef(
  poseKeys: string[],
  symbolTable: SymbolTable,
): string[] {
  return poseKeys.filter((k) => {
    const resolved = resolvePoseRef({ ref: k }, symbolTable);
    return (
      !isError(resolved) &&
      isDefined(resolved.heading) &&
      !isError(resolved.heading)
    );
  });
}

type HeadingType = 'pose' | 'ref' | 'val' | 'none';

const hrIsPose: typecheck<Ref> = chkRef;
const hrIsVal = chkObjectOfExactType<{ angle: Value; inRadians: boolean }>({
  angle: chkValue,
  inRadians: isBoolean,
});
const hrIsRef = chkObjectOfExactType<{ angle: Ref; inRadians: boolean }>({
  angle: chkRef,
  inRadians: isBoolean,
});

function getHeadingType(item: HeadingRef | null): HeadingType {
  if (hrIsPose(item)) {
    return 'pose';
  } else if (hrIsRef(item)) {
    return 'ref';
  } else if (hrIsVal(item)) {
    return 'val';
  } else {
    return 'none';
  }
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
    onChange({
      angle: { val },
      inRadians: hasField(item, 'inRadians') ? item.inRadians : false,
    }),
  );
  const setType = (type: HeadingType) => {
    switch (type) {
      case 'pose': {
        const poseKey = validPoseKeys[0] || '';
        onChange({ ref: poseKey });
        break;
      }
      case 'ref': {
        const valKey = valueKeys[0] || '';
        onChange({ angle: { ref: valKey }, inRadians: false });
        break;
      }
      case 'val': {
        onChange({ angle: { val: 0 }, inRadians: false });
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
      layout="horizontal"
      onChange={(_, data) => {
        setType(data.value as HeadingType);
      }}>
      <Radio value="val" label="Value" />
      <Radio value="ref" label="Named Value" />
      <Radio value="pose" label="Named Pose" />
    </RadioGroup>
  );
  return (
    <TitleWrapper title={label}>
      <>
        {chooser}
        {hrIsPose(item) && (
          // Pose Reference
          <>
            <span>
              <Select
                value={item.ref}
                onChange={(e, d) => onChange({ ref: d.value })}>
                <option key="$" value="" disabled>
                  Select Pose Reference...
                </option>
                {validPoseKeys.map((k) => (
                  <option key={k} value={k}>
                    {k} <SimplePoseRef poseref={symbolTable.poses.get(k)} />
                  </option>
                ))}
              </Select>
            </span>
            {chkErr(resolved) && (
              <Text>
                <AlertFilled />
                {resolved.errors().map((e, i) => (
                  <Fragment key={i}>
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
                  onChange({ ...item, angle: { ref: d.value } })
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
            <Checkbox
              checked={item.inRadians}
              onChange={(e) =>
                onChange({ ...item, inRadians: e.target.checked })
              }
              label="Heading Angle in Radians?"
            />
          </>
        )}
      </>
    </TitleWrapper>
  );
}

export function ResolvedHeadingInline({
  heading,
}: {
  heading: ResolvedHeading;
}): ReactElement {
  return (
    <>
      {chkErr(heading)
        ? `Error: ${heading.errors().join('\n')}`
        : chkErr(heading.angle)
          ? `Error: ${heading.angle.errors().join('\n')} in value`
          : `${heading.angle.toFixed(2)}${heading.inRadians ? ' rads' : '°'}`}
    </>
  );
}

export function HeadingRefInline({
  headingref,
}: {
  headingref?: HeadingRef | undefined;
}): ReactElement {
  if (isUndefined(headingref)) {
    return <Text>Not found</Text>;
  }
  const title = hrIsPose(headingref)
    ? 'Pose Ref'
    : hrIsRef(headingref)
      ? 'Value Ref'
      : hrIsVal(headingref)
        ? 'Value'
        : 'Null';
  const data = hrIsPose(headingref)
    ? headingref.ref
    : hrIsRef(headingref)
      ? headingref.angle.ref
      : hrIsVal(headingref)
        ? headingref.angle.val.toFixed(3)
        : 'null';
  const suffix =
    hrIsPose(headingref) || isUndefined(headingref)
      ? ''
      : headingref.inRadians
        ? 'radians'
        : 'degrees';
  return (
    <Text>
      {title}&nbsp;
      <code>
        {data}&nbsp;
        {suffix}
      </code>
    </Text>
  );
}

export function SimpleHeadingRef({
  headingref,
}: {
  headingref: HeadingRef;
}): ReactElement {
  if (chkRef(headingref)) {
    return (
      <Text>
        Heading from <code>{headingref.ref}</code>
      </Text>
    );
  }
  return (
    <>
      <SimpleValRef valref={headingref.angle} />
      {headingref.inRadians ? <code>&nbsp;rads</code> : <code>°</code>}
    </>
  );
}
