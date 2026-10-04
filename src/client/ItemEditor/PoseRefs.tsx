import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  Text,
} from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { hasField, isDefined, isUndefined } from '@freik/typechk';

import { chkErr, chkRef, PoseRef, ResolvedPose } from '../dto_schema';
import { resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { ResolvedValueInline, ValRefControl, ValRefInline } from './ValRefs';

export type PoseRefControlProps = {
  label: string;
  pose: PoseRef;
  onChange: (npr: PoseRef) => void;
};

// PoseRef Control: Switch between Inline ({ X, Y, Heading, inRadians }) and Ref ({ ref })
export function PoseRefControl({
  label,
  pose,
  onChange,
}: PoseRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const poseKeys = Array.from(symbolTable.poses.keys());
  const isRef = chkRef(pose);
  const resolved = resolvePoseRef(pose, symbolTable);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: poseKeys[0] || '' });
    } else {
      onChange({
        X: { val: 0 },
        Y: { val: 0 },
        Heading: { val: 0 },
        inRadians: false,
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
              value={pose?.ref || ''}
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
                for {pose?.ref}
              </Text>
            )}
          </span>
        ) : (
          <div>
            <ValRefControl
              label="X Coordinate"
              value={pose?.X || { val: 0 }}
              onChange={(X) => onChange({ ...pose, X })}
            />
            <ValRefControl
              label="Y Coordinate"
              value={pose?.Y || { val: 0 }}
              onChange={(Y) => onChange({ ...pose, Y })}
            />
            <ValRefControl
              label="Heading Angle"
              value={pose?.Heading || { val: 0 }}
              onChange={(Heading) => onChange({ ...pose, Heading })}
            />

            <div>
              <Checkbox
                checked={Boolean(pose?.inRadians)}
                onChange={(e) =>
                  onChange({ ...pose, inRadians: e.target.checked })
                }
                label="Heading Angle in Radians?"
              />
            </div>
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
      (X:
      <ResolvedValueInline value={pose.X} />, Y:
      <ResolvedValueInline value={pose.Y} />)
    </>
  );
  const heading = isDefined(pose.Heading) ? (
    <>
      , @<ResolvedValueInline value={pose.Heading} />°
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
      X: <ValRefInline valref={poseref.X} />, Y:{' '}
      <ValRefInline valref={poseref.Y} />
    </>
  );
  const heading = hasField(poseref, 'Heading') ? (
    <>
      θ: <ValRefInline valref={poseref.Heading} />
      {poseref.inRadians ? ' in radians' : ' in degrees'}
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
