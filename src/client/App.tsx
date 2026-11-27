// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { Provider, useAtomValue } from 'jotai';

import {
  FluentProvider,
  makeStyles,
  Toaster,
  tokens,
  Toolbar,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { CodeIssues } from './CodeIssues';
import { FieldRenderer } from './FieldRenderer';
import { SaveButton, TeamSelector, UploadToRobot } from './FileChoosing';
import { SearchToolbar } from './Lists/SearchableTable';
import {
  DataTabList,
  SelectedDataList,
  SelectedEditor,
} from './PathsDataDisplay';
import { Settings } from './Settings';
import { ToastId } from './state/BasicState';
import { ThemeAtom } from './state/SavedSettings';
import { getStore } from './state/Storage';
import { Toolbox } from './Toolbox';

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
    overflow: 'hidden',
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
          <FieldRenderer />
        </Panel>
        <Separator id="view-separator" />
        <Panel className={toolbarStyle.gridPanelContainer}>
          <div className={toolbarStyle.header}>
            <DataTabList />
            <SearchToolbar />
          </div>
          <div className={toolbarStyle.dataList}>
            <SelectedDataList />
            <CodeIssues />
          </div>
          <div className={toolbarStyle.dialogSection}>
            <SelectedEditor />
          </div>
          <Toolbar size="medium" className={toolbarStyle.footer}>
            <TeamSelector />
            <SaveButton />
            <UploadToRobot />
            <Toolbox />
            <Settings />
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
  // TODO: Make a Pedro or FIRST color theme:
  // Details:
  // https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-theming--docs
  // Colors:
  // FIRST colors #0066B3, #ED1C24,
  // plus FTC #F57E258, FRC #009cd7, and FLL #ed1c24, #662D91, #00a651
  // Pedro colors are #FE55A2, #FFC516, and #E1461B
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
