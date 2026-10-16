// SPDX-License-Identifier: AGPL-3.0-or-later

import { Fragment, ReactElement, Suspense } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import {
  InfoLabel,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  Text,
} from '@fluentui/react-components';

import { CurvesView } from './Panels/CurvesView';
import { InterpolatorsView } from './Panels/InterpolatorsView';
import { JsonView } from './Panels/JsonView';
import { PathsView } from './Panels/PathsView';
import { PosesView } from './Panels/PosesView';
import { ValuesView } from './Panels/ValuesView';
import { activeTabAtom } from './state/SymbolTable';
import { SelectedClassAtom, SelectedPathAtom } from './state/UserCode';

export function PathsDataDisplay({
  expand,
}: {
  expand?: boolean;
}): ReactElement {
  const tabInfo: [string, string | ReactElement, ReactElement][] = [
    ['v', 'Values', <ValuesView />],
    ['p', 'Poses', <PosesView />],
    ['i', 'Interpolations', <InterpolatorsView />],
    ['c', 'Lines & Curves', <CurvesView />],
    ['P', 'Paths', <PathsView />],
    ['j', 'Raw JSON', <JsonView />],
  ];

  const selFile = useAtomValue(SelectedPathAtom);
  const selClass = useAtomValue(SelectedClassAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
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
