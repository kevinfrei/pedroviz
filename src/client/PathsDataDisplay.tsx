// SPDX-License-Identifier: AGPL-3.0-or-later

import { Fragment, ReactElement, Suspense, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import {
  InfoLabel,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  Text,
} from '@fluentui/react-components';

import { NamedBezierList } from './Displays/CurveDisplay';
import { PathChainList } from './Displays/PathChainDisplay';
import { NamedPoseList } from './Displays/PoseDisplay';
import { NamedValueList } from './Displays/ValueDisplay';
import { CurvesEditor } from './NewStuff/CurvesEditor';
import { InterpolatorsEditor } from './NewStuff/InterpolatorsEditor';
import { PathsEditor } from './NewStuff/PathsEditor';
import { PosesEditor } from './NewStuff/PosesEditor';
import { ValuesEditor } from './NewStuff/ValuesEditor';
import {
  FocusedCurveAtom,
  FocusedPathAtom,
  FocusedPoseAtom,
  NamedValuesAtom,
  SelectedClassAtom,
  SelectedPathAtom,
} from './state/UserCode';

// function FileInfo() {
//   const pc = useAtomValue(SelectedParsedClassAtom);
//   if (isUndefined(pc)) {
//     return <></>;
//   }
//   return <span>Class:&nbsp;{pc.fullName}</span>;
// }

export function PathsDataDisplay({
  expand,
}: {
  expand?: boolean;
}): ReactElement {
  const namedValues = useAtomValue(NamedValuesAtom);
  const tabInfo: [string, string | ReactElement, ReactElement][] = [
    // ['v', 'Values [old]', <NamedValueList items={namedValues.map((nv) => nv.name)} />],
    ['v2', 'Values', <ValuesEditor />],
    // ['p', 'Poses [old]', <NamedPoseList />],
    ['p2', 'Poses', <PosesEditor />],
    [
      'i',
      <InfoLabel info="The direction the robot faces, along a path">
        Interpolations
      </InfoLabel>,
      <InterpolatorsEditor />,
    ],
    // ['c', 'Lines & Curves [old]', <NamedBezierList />],
    ['c2', 'Lines & Curves', <CurvesEditor />],
    // ['P', 'Paths [old]', <PathChainList />],
    ['P2', 'Paths', <PathsEditor />],
  ];

  const selFile = useAtomValue(SelectedPathAtom);
  const selClass = useAtomValue(SelectedClassAtom);
  const setFocusedPose = useSetAtom(FocusedPoseAtom);
  const setFocusedCurve = useSetAtom(FocusedCurveAtom);
  const setFocusedPath = useSetAtom(FocusedPathAtom);
  const [activeTab, setActiveTab] = useState('P');
  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setActiveTab(data.value as string);
  };

  if (selFile.length === 0 || selClass.length === 0) {
    return <Text size={600}>Please select a file & class to view.</Text>;
  }
  return (
    <div>
      <TabList selectedValue={activeTab} onTabSelect={onTabSelect}>
        {tabInfo.map(([val, nm]) => (
          <Tab key={val} value={val}>
            {nm}
          </Tab>
        ))}
      </TabList>
      <Suspense>
        {tabInfo.map(([val, , Elem], i) => (
          <Fragment key={i}>{val === activeTab && Elem}</Fragment>
        ))}
      </Suspense>
    </div>
  );
}
