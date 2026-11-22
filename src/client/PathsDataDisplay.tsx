// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Tab, TabList, TabListProps, Text } from '@fluentui/react-components';
import { SpinSuspense } from '@freik/fluent9-tools';
import { isUndefined } from '@freik/typechk';

import { CurvesView } from './Panels/CurvesView';
import { InterpolatorsView } from './Panels/InterpolatorsView';
import { JsonView } from './Panels/JsonView';
import { PathsView } from './Panels/PathsView';
import { PosesView } from './Panels/PosesView';
import { ValuesView } from './Panels/ValuesView';
import { activeTabAtom, DataType } from './state/SymbolTable';
import { SelectedPathsAtom } from './state/UserCode';

export function DataTabList(): ReactElement {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const onTabSelect: TabListProps['onTabSelect'] = (_, data) =>
    setActiveTab(data.value as DataType);
  return (
    <TabList
      style={{ display: 'flex', flexWrap: 'wrap' }}
      selectedValue={activeTab}
      onTabSelect={onTabSelect}>
      {tabInfo.map(({ key, title }) => (
        <Tab key={key} value={key}>
          {title}
        </Tab>
      ))}
    </TabList>
  );
}

type TabInfo = { key: DataType; title: string; element: ReactElement };
const mkTabInfo = (key: DataType, title: string, element: ReactElement) => ({
  key,
  title,
  element,
});
const tabInfo: TabInfo[] = [
  mkTabInfo(DataType.Values, 'Values', <ValuesView />),
  mkTabInfo(DataType.Poses, 'Poses', <PosesView />),
  mkTabInfo(DataType.Interpolations, 'Interpolations', <InterpolatorsView />),
  mkTabInfo(DataType.Curves, 'Lines & Curves', <CurvesView />),
  mkTabInfo(DataType.Paths, 'Paths', <PathsView />),
  mkTabInfo(DataType.JSON, 'Raw JSON', <JsonView />),
];

export function SelectedDataList(): ReactElement {
  const activeTab = useAtomValue(activeTabAtom);
  const selFile = useAtomValue(SelectedPathsAtom);
  if (isUndefined(selFile)) {
    return <Text size={600}>Please select a bot to view.</Text>;
  }
  return (
    <>
      {tabInfo.map(({ key, element }) => (
        <SpinSuspense key={key}>
          <div hidden={key === activeTab ? false : true}>{element}</div>
        </SpinSuspense>
      ))}
    </>
  );
}
