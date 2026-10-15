// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { Provider, useAtomValue, useSetAtom } from 'jotai';

import {
  Button,
  FluentProvider,
  makeStyles,
  Toaster,
  Toolbar,
  ToolbarGroup,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { SpinSuspense } from '@freik/fluent9-tools';

import { CodeIssues } from './CodeIssues';
import { Strings } from './constants';
import { FieldRenderer } from './FieldRenderer';
import { PathsDataDisplay } from './PathsDataDisplay';
import { TeamSelector } from './PathSelector';
import { Settings } from './Settings';
import { ToastId } from './state/BasicState';
import { ThemeAtom } from './state/SavedSettings';
import { getStore } from './state/Storage';
import { FullDatabaseAtom } from './state/UserCode';

const useStyles = makeStyles({
  toolbar: {
    justifyContent: 'space-between',
  },
});

function MyApp(): ReactElement {
  const rescanCode = useSetAtom(FullDatabaseAtom);
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
          <SpinSuspense>
            <Toolbar size="medium" className={toolbarStyle.toolbar}>
              <ToolbarGroup>
                <Settings />
                <div style={{ width: '8px' }} />
                <Button onClick={() => rescanCode()}>
                  {Strings.rescan_source}
                </Button>
              </ToolbarGroup>
              <ToolbarGroup>
                <TeamSelector />
              </ToolbarGroup>
            </Toolbar>
          </SpinSuspense>
          <SpinSuspense>
            <PathsDataDisplay />
            <CodeIssues />
          </SpinSuspense>
          <Toaster toasterId={ToastId} position="top" />
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
