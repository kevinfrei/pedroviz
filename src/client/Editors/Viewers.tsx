import { ReactElement } from 'react';

import { Text } from '@fluentui/react-components';
import { hasField, isUndefined } from '@freik/typechk';

import { chkErr, chkRef, HeadingRef, PoseRef, ValRef } from '../../dataTypes';
import { ResolvedHeading, ResolvedPose, ResolvedValue } from '../ResolvedTypes';
import { hrIsPose, hrIsRef, hrIsVal } from './EditorTypes';

type ResolvedPoseProps = { pose: ResolvedPose; displayHeading: boolean };
export function ResolvedPose({
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

function ResolvedHeadingInline({
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

function HeadingRefInline({
  headingref,
}: {
  headingref?: HeadingRef | undefined;
}): ReactElement {
  if (isUndefined(headingref)) {
    return <Text>Not found</Text>;
  }
  const title = hrIsPose(headingref)
    ? 'Named Pose'
    : hrIsRef(headingref)
      ? 'Named Value'
      : hrIsVal(headingref)
        ? ''
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
        ? 'rads'
        : '˚';
  return (
    <Text>
      {title}&nbsp;
      <code>
        {data}
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

function ResolvedValueInline({
  value,
}: {
  value: ResolvedValue;
}): ReactElement {
  return (
    <>
      {chkErr(value) ? `Error: ${value.errors().join('\n')}` : value.toFixed(2)}
    </>
  );
}
// Maximally 4 digits of accuracy number to string conversion
/*export*/ function FormatValue(val: number): string {
  return val.toFixed(4).replace(/\.?0+$/, '');
}

export function SimpleValRef({
  valref,
}: {
  valref: ValRef | undefined;
}): ReactElement {
  if (isUndefined(valref)) {
    return <Text color="red">Undefined!</Text>;
  } else if (chkRef(valref)) {
    return <code>"{valref.ref}"</code>;
  } else {
    return <code>{FormatValue(valref.val)}</code>;
  }
}
