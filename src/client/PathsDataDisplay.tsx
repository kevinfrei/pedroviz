// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, Suspense } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Tab, TabList, TabListProps, Text } from '@fluentui/react-components';
import { isUndefined } from '@freik/typechk';

import { CurvesView } from './Panels/CurvesView';
import { InterpolatorsView } from './Panels/InterpolatorsView';
import { JsonView } from './Panels/JsonView';
import { PathsView } from './Panels/PathsView';
import { PosesView } from './Panels/PosesView';
import { ValuesView } from './Panels/ValuesView';
import { activeTabAtom, DataType } from './state/SymbolTable';
import { SelectedPathsAtom } from './state/UserCode';

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

export function PathsDataDisplay(): ReactElement {
  const selFile = useAtomValue(SelectedPathsAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const onTabSelect: TabListProps['onTabSelect'] = (_, data) =>
    setActiveTab(data.value as DataType);
  if (isUndefined(selFile)) {
    return <Text size={600}>Please select a file & class to view.</Text>;
  }
  return (
    <>
      <TabList selectedValue={activeTab} onTabSelect={onTabSelect}>
        {tabInfo.map(({ key, title }) => (
          <Tab key={key} value={key}>
            {title}
          </Tab>
        ))}
      </TabList>
      <Suspense>
        {tabInfo.map(({ key, element }) => (
          <div key={key} hidden={key === activeTab ? false : true}>
            {element}
          </div>
        ))}
      </Suspense>
    </>
  );
}
