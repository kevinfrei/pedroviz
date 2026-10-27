// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { Fragment, ReactElement, Suspense } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import {
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  TabListProps,
  Text,
} from '@fluentui/react-components';
import { isUndefined } from '@freik/typechk';

import { CurvesView } from './Panels/CurvesView';
import { InterpolatorsView } from './Panels/InterpolatorsView';
import { JsonView } from './Panels/JsonView';
import { PathsView } from './Panels/PathsView';
import { PosesView } from './Panels/PosesView';
import { ValuesView } from './Panels/ValuesView';
import { activeTabAtom } from './state/SymbolTable';
import { SelectedPathsAtom } from './state/UserCode';

type TabInfo = { key: string; title: string; element: ReactElement };
const mkTabInfo = (key: string, title: string, element: ReactElement) => ({
  key,
  title,
  element,
});
const tabInfo: TabInfo[] = [
  mkTabInfo('v', 'Values', <ValuesView />),
  mkTabInfo('p', 'Poses', <PosesView />),
  mkTabInfo('i', 'Interpolations', <InterpolatorsView />),
  mkTabInfo('c', 'Lines & Curves', <CurvesView />),
  mkTabInfo('P', 'Paths', <PathsView />),
  mkTabInfo('j', 'Raw JSON', <JsonView />),
];

export function PathsDataDisplay(): ReactElement {
  const selFile = useAtomValue(SelectedPathsAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const onTabSelect: TabListProps['onTabSelect'] = (_, data) =>
    setActiveTab(data.value as string);
  if (isUndefined(selFile)) {
    return <Text size={600}>Please select a file & class to view.</Text>;
  }
  return (
    <div>
      <TabList selectedValue={activeTab} onTabSelect={onTabSelect}>
        {tabInfo.map(({ key, title }) => (
          <Tab key={key} value={key}>
            {title}
          </Tab>
        ))}
      </TabList>
      <Suspense>
        {tabInfo.map(({ key, element }) => (
          <Fragment key={key}>{key === activeTab && element}</Fragment>
        ))}
      </Suspense>
    </div>
  );
}
