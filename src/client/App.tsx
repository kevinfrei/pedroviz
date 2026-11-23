// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { Provider, useAtomValue } from 'jotai';

import {
  FluentProvider,
  makeStyles,
  Toaster,
  tokens,
  Toolbar,
  ToolbarGroup,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { SpinSuspense } from '@freik/fluent9-tools';

import { CodeIssues } from './CodeIssues';
import { EditorDialog } from './Editors/EditorDialog';
import { FieldRenderer } from './FieldRenderer';
import {
  RemoveUpload,
  SaveButton,
  TeamSelector,
  UploadToRobot,
} from './FileChoosing';
import { SearchToolbar } from './Lists/SearchableTable';
import { DataTabList, SelectedDataList } from './PathsDataDisplay';
import { Settings } from './Settings';
import { ToastId } from './state/BasicState';
import { ThemeAtom } from './state/SavedSettings';
import { getStore } from './state/Storage';

const useStyles = makeStyles({
  gridPanelContainer: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    gridColumn: '1 / -1',
    gridRow: 1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  dataList: {
    gridColumn: 1,
    gridRow: 2,
    overflow: 'auto',
    minWidth: 0,
    minHeight: 0,
  },
  dialogSection: {
    gridColumn: 2,
    gridRow: 2,
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 0,
    minHeight: 0,
  },
  footer: {
    gridColumn: '1 / -1',
    gridRow: 3,
    borderTop: '1px solid #333',
    flex: '0 0 auto',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '4px 4px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  },
});

function MyApp(): ReactElement {
  const toolbarStyle = useStyles();
  return (
    <div className="app">
      <Group className="main">
        <Panel className="display">
          <SpinSuspense>
            <FieldRenderer />
          </SpinSuspense>
        </Panel>
        <Separator id="view-separator" />
        <Panel className={toolbarStyle.gridPanelContainer}>
          <div className={toolbarStyle.header}>
            <SpinSuspense>
              <DataTabList />
              <SearchToolbar />
            </SpinSuspense>
          </div>
          <div className={toolbarStyle.dataList}>
            <SpinSuspense>
              <SelectedDataList />
              <CodeIssues />
            </SpinSuspense>
          </div>
          <div className={toolbarStyle.dialogSection}>
            <EditorDialog />
          </div>
          <Toolbar size="medium" className={toolbarStyle.footer}>
            <SpinSuspense>
              <TeamSelector />
              <SaveButton />
              <UploadToRobot />
              <RemoveUpload />
              <Settings />
            </SpinSuspense>
          </Toolbar>
          <Toaster toasterId={ToastId} position="bottom" />
        </Panel>
      </Group>
    </div>
  );
}

function FluentApp(): ReactElement {
  const theTheme = useAtomValue(ThemeAtom);
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;

  return (
    <FluentProvider theme={theme}>
      <MyApp />
    </FluentProvider>
  );
}

export const App = () => (
  <Provider store={getStore()}>
    <FluentApp />
  </Provider>
);
