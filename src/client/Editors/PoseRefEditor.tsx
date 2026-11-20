// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Radio, RadioGroup, Select, Text } from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { hasField, isDefined, isError, isUndefined } from '@freik/typechk';

import {
  chkErr,
  chkRef,
  HeadingRef,
  makeNewPose,
  makeNewVal,
  PoseRef,
  SymbolTable,
} from '../../dataTypes';
import { ResolvedPose } from '../ResolvedTypes';
import { resolvePoseRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import {
  HeadingRefEditor,
  HeadingRefInline,
  ResolvedHeadingInline,
} from './HeadingRefEditor';
import {
  ResolvedValueInline,
  SimpleValRef,
  ValRefEditor,
} from './ValRefEditor';

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

export type PoseRefEditorProps = {
  label: string | ReactElement;
  item: PoseRef;
  name?: string;
  topLevel?: boolean;
  heading?: boolean;
  onChange: (npr: PoseRef) => void;
};

// PoseRef Control: Switch between Inline ({ X, Y, Heading, inRadians }) and Ref ({ ref })
export function PoseRefEditor({
  label,
  item,
  name,
  onChange,
  topLevel,
  heading,
}: PoseRefEditorProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const validPoseKeys = validPosesForRef(
    Array.from(symbolTable.poses.keys()),
    symbolTable,
    name,
  );
  const isRef = chkRef(item);
  const resolved = resolvePoseRef(item, symbolTable);
  const displayHeading = isDefined(heading) ? heading : true;

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      onChange({ ref: validPoseKeys[0] || '' });
    } else {
      onChange(makeNewPose());
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
            <div style={{ paddingTop: 5 }}>
              <ResolvedPose displayHeading={displayHeading} pose={resolved} />
            </div>
          </span>
        ) : (
          <div>
            <ValRefEditor
              label="X Coordinate"
              item={item?.X || makeNewVal()}
              onChange={(X) => onChange({ ...item, X })}
            />
            <ValRefEditor
              label="Y Coordinate"
              item={item?.Y || makeNewVal()}
              onChange={(Y) => onChange({ ...item, Y })}
            />
            {displayHeading && (
              <HeadingRefEditor
                label="Heading Angle"
                optional={true}
                item={item?.heading || null}
                onChange={(heading: HeadingRef | null) => {
                  if (isDefined(heading) && heading !== null) {
                    onChange({ ...item, heading });
                  } else {
                    onChange({ X: item.X, Y: item.Y });
                  }
                }}
              />
            )}
          </div>
        )}
      </>
    </TitleWrapper>
  );
}

type ResolvedPoseProps = { pose: ResolvedPose; displayHeading: boolean };
function ResolvedPose({
  pose,
  displayHeading,
}: ResolvedPoseProps): ReactElement {
  if (chkErr(pose)) {
    return <>Not Found</>;
  }
  return (
    <>
      X:
      <ResolvedValueInline value={pose.X} />, Y:
      <ResolvedValueInline value={pose.Y} />
      {displayHeading && pose.heading && (
        <>
          , θ: <ResolvedHeadingInline heading={pose.heading} />
        </>
      )}
    </>
  );
}

type SimplePoseRefProps = { poseref?: PoseRef; onlyHeading?: boolean };
export function SimplePoseRef({
  poseref,
  onlyHeading,
}: SimplePoseRefProps): ReactElement {
  if (isUndefined(poseref)) {
    return <Text color="red">Undefined!</Text>;
  } else if (chkRef(poseref)) {
    return <code>"{poseref.ref}"</code>;
  }
  return onlyHeading ? (
    <Text>
      θ:
      <HeadingRefInline headingref={poseref.heading} />
    </Text>
  ) : (
    <Text>
      X:
      <SimpleValRef valref={poseref.X} />, Y:
      <SimpleValRef valref={poseref.Y} />
      {hasField(poseref, 'heading') && (
        <>
          , θ:
          <HeadingRefInline headingref={poseref.heading} />
        </>
      )}
    </Text>
  );
}
