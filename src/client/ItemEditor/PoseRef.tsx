// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Radio, RadioGroup, Select, Text } from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { hasField, isDefined, isUndefined } from '@freik/typechk';

import { chkErr, chkRef } from '../../DataTypeChecks';
import { PoseRef } from '../../DataTypes';
import { ResolvedPose } from '../ResolvedTypes';
import { resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import {
  HeadingRefControl,
  HeadingRefInline,
  ResolvedHeadingInline,
} from './HeadingRef';
import { ResolvedValueInline, ValRefControl, ValRefInline } from './ValRef';

export type PoseRefControlProps = {
  label: string;
  item: PoseRef;
  onChange: (npr: PoseRef) => void;
};

// PoseRef Control: Switch between Inline ({ X, Y, Heading, inRadians }) and Ref ({ ref })
export function PoseRefControl({
  label,
  item,
  onChange,
}: PoseRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const poseKeys = Array.from(symbolTable.poses.keys());
  const isRef = chkRef(item);
  const resolved = resolvePoseRef(item, symbolTable);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: poseKeys[0] || '' });
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
              {poseKeys.map((k) => (
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

export function PoseRefInline({
  poseref,
}: {
  poseref: PoseRef | undefined;
}): ReactElement {
  if (isUndefined(poseref)) {
    return <>Not found</>;
  }
  if (chkRef(poseref)) {
    return (
      <>
        Ref <code>{poseref.ref}</code>
      </>
    );
  }
  const coord = (
    <>
      X:
      <ValRefInline valref={poseref.X} />, Y:
      <ValRefInline valref={poseref.Y} />
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
    <>
      {coord}
      {heading}
    </>
  );
}
