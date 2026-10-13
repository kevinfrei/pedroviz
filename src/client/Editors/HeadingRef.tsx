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
  isBoolean,
  isDefined,
  isError,
  isUndefined,
  typecheck,
} from '@freik/typechk';

import { chkErr, chkRef, chkValue } from '../../DataTypeChecks';
import { HeadingRef, Ref, SymbolTable, Value } from '../../DataTypes';
import { ResolvedHeading } from '../ResolvedTypes';
import { resolveHeadingRef, resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { SimplePoseRef } from './PoseRef';
import { SimpleValRef } from './ValRef';

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

type HeadingType = 'pose' | 'ref' | 'val';

const hrIsPose: typecheck<Ref> = chkRef;
const hrIsVal = chkObjectOfExactType<{ angle: Value; inRadians: boolean }>({
  angle: chkValue,
  inRadians: isBoolean,
});
const hrIsRef = chkObjectOfExactType<{ angle: Ref; inRadians: boolean }>({
  angle: chkRef,
  inRadians: isBoolean,
});

export type HeadingRefControlProps = {
  label: string;
  item: HeadingRef;
  onChange: (headingRef: HeadingRef) => void;
};

// HeadingRef Control: Switch between Inline ({ angle: ValRef, inRadians: Boolean }) and PoseRef ({ ref })
// This is intentionally not allowing inline poses. I think that's probably silly/unnecessary anyway.
export function HeadingRefControl({
  label,
  item,
  onChange,
}: HeadingRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const valueKeys = [...symbolTable.values.keys()];
  const validPoseKeys = validPosesForRef(
    [...symbolTable.poses.keys()],
    symbolTable,
  );
  const headingType = hrIsPose(item) ? 'pose' : hrIsRef(item) ? 'ref' : 'val';
  const resolved = resolveHeadingRef(item, symbolTable);
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
    }
  };

  return (
    <TitleWrapper title={label}>
      <>
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
        {!hrIsPose(item) && (
          <>
            {hrIsVal(item) && (
              // Numeric Angle value
              <SpinButton
                precision={3}
                step={1}
                stepPage={10}
                value={item.angle.val}
                onChange={(_, d) =>
                  onChange({ angle: { val: d.value || 0 }, inRadians: false })
                }
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
