// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { Provider, useAtomValue, useSetAtom } from 'jotai';

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
import { PathsDataDisplay } from './PathsDataDisplay';
import { FileSelector, TeamSelector } from './PathSelector';
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
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: '0px 4px',
    display: 'flex',
    justifyContent: 'space-between', // Aligns buttons to the right (or 'space-between', etc.)
    gap: '8px',
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
                <PathsDataDisplay />
                <CodeIssues />
              </SpinSuspense>
            </div>
            <Toolbar size="medium" className={toolbarStyle.bottomToolbar}>
              <ToolbarGroup>
                <Settings />
              </ToolbarGroup>
              <ToolbarGroup>
                <SpinSuspense>
                  <TeamSelector />
                  <FileSelector />
                </SpinSuspense>
              </ToolbarGroup>
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
