// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Radio, RadioGroup, Select, Text } from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { hasField, isDefined, isError, isUndefined } from '@freik/typechk';

import { chkErr, chkRef } from '../../DataTypeChecks';
import { PoseRef, SymbolTable } from '../../DataTypes';
import { ResolvedPose } from '../ResolvedTypes';
import { resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import {
  HeadingRefControl,
  HeadingRefInline,
  ResolvedHeadingInline,
} from './HeadingRef';
import { ResolvedValueInline, SimpleValRef, ValRefControl } from './ValRef';

// Filter out pose names that would result in errors
function validPosesForRef(
  poseKeys: string[],
  symbolTable: SymbolTable,
  name?: string,
): string[] {
  if (isUndefined(name)) {
    return poseKeys;
  }
  return poseKeys.filter(
    (k) =>
      k !== name &&
      !isError(resolvePoseRef({ ref: k }, symbolTable, new Set([name]))),
  );
}

export type PoseRefControlProps = {
  label: string;
  item: PoseRef;
  name?: string;
  onChange: (npr: PoseRef) => void;
};

// PoseRef Control: Switch between Inline ({ X, Y, Heading, inRadians }) and Ref ({ ref })
export function PoseRefControl({
  label,
  item,
  name,
  onChange,
}: PoseRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const validPoseKeys = validPosesForRef(
    Array.from(symbolTable.poses.keys()),
    symbolTable,
    name,
  );
  const isRef = chkRef(item);
  const resolved = resolvePoseRef(item, symbolTable);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: validPoseKeys[0] || '' });
    } else {
      onChange({
        X: { val: 0 },
        Y: { val: 0 },
        heading: { angle: { val: 0 }, inRadians: false },
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
          <Radio value="val" label="Pose" />
          <Radio value="ref" label="Reference" />
        </RadioGroup>

        {isRef ? (
          <span>
            <Select
              value={item?.ref || ''}
              onChange={(e, d) => onChange({ ref: d.value })}>
              <option key="$" value="" disabled>
                Select Pose Reference...
              </option>
              {validPoseKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
            {chkErr(resolved) && (
              <Text>
                <AlertFilled />
                {resolved.errors().map((e, i) => (
                  <span key={i}>
                    <Text>{e}</Text>
                    <br />
                  </span>
                ))}
                for {item?.ref}
              </Text>
            )}
          </span>
        ) : (
          <div>
            <ValRefControl
              label="X Coordinate"
              item={item?.X || { val: 0 }}
              onChange={(X) => onChange({ ...item, X })}
            />
            <ValRefControl
              label="Y Coordinate"
              item={item?.Y || { val: 0 }}
              onChange={(Y) => onChange({ ...item, Y })}
            />
            <HeadingRefControl
              label="Heading Angle"
              item={item?.heading || { angle: { val: 0 }, inRadians: false }}
              onChange={(Heading) => onChange({ ...item, heading: Heading })}
            />
          </div>
        )}

        <div>
          <span>Computed Position:</span>
          <span>
            <ResolvedPose pose={resolved} />
          </span>
        </div>
      </>
    </TitleWrapper>
  );
}

function ResolvedPose({ pose }: { pose: ResolvedPose }): ReactElement {
  if (chkErr(pose)) {
    return <>Not Found</>;
  }
  const coord = (
    <>
      X:
      <ResolvedValueInline value={pose.X} />, Y:
      <ResolvedValueInline value={pose.Y} />
    </>
  );
  const heading = isDefined(pose.heading) ? (
    <>
      , θ: <ResolvedHeadingInline heading={pose.heading} />
    </>
  ) : (
    <></>
  );
  return (
    <>
      {coord}
      {heading}
    </>
  );
}

export function SimplePoseRef({
  poseref,
}: {
  poseref: PoseRef | undefined;
}): ReactElement {
  if (isUndefined(poseref)) {
    return <Text color="red">Undefined!</Text>;
  }
  if (chkRef(poseref)) {
    return (
      <Text>
        Named Pose <code>{poseref.ref}</code>
      </Text>
    );
  }
  const coord = (
    <>
      X:
      <SimpleValRef valref={poseref.X} />, Y:
      <SimpleValRef valref={poseref.Y} />
    </>
  );
  const heading = hasField(poseref, 'heading') ? (
    <>
      , θ:
      <HeadingRefInline headingref={poseref.heading} />
    </>
  ) : (
    <></>
  );
  return (
    <Text>
      {coord}
      {heading}
    </Text>
  );
}
