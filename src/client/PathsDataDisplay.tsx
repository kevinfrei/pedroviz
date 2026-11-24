// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Tab, TabList, TabListProps, Text } from '@fluentui/react-components';
import { SpinSuspense } from '@freik/fluent9-tools';
import { isUndefined } from '@freik/typechk';

import { CurvesList } from './Lists/CurvesList';
import { InterpolatorsList } from './Lists/InterpolatorsList';
import { PathsList } from './Lists/PathsList';
import { PosesList } from './Lists/PosesList';
import { ValuesList } from './Lists/ValuesList';
import { CurveEditor } from './Panels/CurvesView';
import { InterpolatorEditor } from './Panels/InterpolatorsView';
import { JsonView } from './Panels/JsonView';
import { PathEditor } from './Panels/PathsView';
import { PoseEditor } from './Panels/PosesView';
import { ValueEditor } from './Panels/ValuesView';
import {
  activeTabAtom,
  DataType,
  selectedActiveItemAtom,
} from './state/SymbolTable';
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

type TabInfo = {
  key: DataType;
  title: string;
  list: ReactElement;
  editor: ReactElement;
};
const mkTabInfo = (
  key: DataType,
  title: string,
  list: ReactElement,
  editor: ReactElement,
) => ({
  key,
  title,
  list,
  editor,
});
const tabInfo: TabInfo[] = [
  mkTabInfo(DataType.Values, 'Values', <ValuesList />, <ValueEditor />),
  mkTabInfo(DataType.Poses, 'Poses', <PosesList />, <PoseEditor />),
  mkTabInfo(
    DataType.Interpolations,
    'Interpolations',
    <InterpolatorsList />,
    <InterpolatorEditor />,
  ),
  mkTabInfo(DataType.Curves, 'Lines & Curves', <CurvesList />, <CurveEditor />),
  mkTabInfo(DataType.Paths, 'Paths', <PathsList />, <PathEditor />),
  mkTabInfo(DataType.JSON, 'Raw JSON', <JsonView />, <></>),
];

export function SelectedDataList(): ReactElement {
  const activeTab = useAtomValue(activeTabAtom);
  const selFile = useAtomValue(SelectedPathsAtom);
  if (isUndefined(selFile)) {
    return <Text size={600}>Please select a bot to view.</Text>;
  }
  return (
    <>
      {tabInfo.map(({ key, list }) => (
        <SpinSuspense key={key}>
          <div hidden={key === activeTab ? false : true}>{list}</div>
        </SpinSuspense>
      ))}
    </>
  );
}

export function SelectedEditor(): ReactElement {
  const activeTab = useAtomValue(activeTabAtom);
  const selectedActive = useAtomValue(selectedActiveItemAtom);
  const item = tabInfo.filter(({ key }) => key === activeTab);
  if (item.length === 0 || isUndefined(selectedActive)) {
    return <></>;
  }
  return item[0]!.editor;
}
