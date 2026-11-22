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
  // The panel container acts as a vertical flexbox
  panelContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden', // Prevents outer panel scrollbars
  },
  // Content area starts at the top and handles scrolling when it overflows
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '0px',
    minHeight: 0, // This makes flex child scrolling work
  },
  // Toolbar stays pinned across the bottom of the panel
  bottomToolbar: {
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
        <Panel className="sidebar">
          <div className={toolbarStyle.panelContainer}>
            <div className={toolbarStyle.scrollableContent}>
              <SpinSuspense>
                <DataTabList />
                <SearchToolbar />
                <SelectedDataList />
                <CodeIssues />
              </SpinSuspense>
            </div>
            <Toolbar size="medium" className={toolbarStyle.bottomToolbar}>
              <SpinSuspense>
                <TeamSelector />
                <SaveButton />
                <UploadToRobot />
                <RemoveUpload />
                <Settings />
              </SpinSuspense>
            </Toolbar>
            <Toaster toasterId={ToastId} position="bottom" />
          </div>
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
