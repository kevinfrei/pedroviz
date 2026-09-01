// SPDX-License-Identifier: AGPL-3.0-or-later

/// <reference lib="dom" />

import { beforeEach, describe, expect, test } from 'bun:test';
import { ReactElement } from 'react';
import { Provider, useAtom } from 'jotai';

import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Pickle } from '@freik/typechk';

import '@testing-library/jest-dom';

import { Path, Team } from '../../IpcTypes';
import { Strings } from '../constants';
import { PathsDataDisplay } from '../PathsDataDisplay';
import { PathSelector } from '../PathSelector';
import { ThemeAtom } from '../state/SavedSettings';
import { getStore } from '../state/Storage';
import {
  // ClearCache,
  // ColorForNumber,
  ColorsAtom,
  NamedBeziersAtom,
  // MappedBeziersAtom,
  NamedPosesAtom,
  NamedValuesAtom,
  PathsForSelectedTeamAtom,
  SelectedClassAtom,
  SelectedPathAtom,
  SelectedTeamAtom,
  ValuesLookupAtom,
} from '../state/UserCode';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';

import './jest-dom-types-fix.test';

import { NamedBezierList } from '../Displays/CurveDisplay';
import { NamedPoseList } from '../Displays/PoseDisplay';
import { NamedValueList } from '../Displays/ValueDisplay';
import {
  databaseForUITest,
  ParsedClassForUITest,
  status,
  testParsedClassForUITest,
} from './testpaths.input';

async function MyFetchFunc(
  key: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  switch (key) {
    case '/api/loadpath/team1/path2.java': {
      const body = JSON.stringify(testParsedClassForUITest);
      return new Response(body, status);
    }
    case '/api/loadpath/team2/path3.java': {
      const body = JSON.stringify(ParsedClassForUITest);
      return new Response(body, status);
    }
    case '/api/db': {
      const body = Pickle(databaseForUITest);
      return new Response(body, status);
    }
  }
  throw new Error(`Unknown key: ${key}`);
}
MyFetchFunc.preconnect = () => {};

function FluentFixture({
  change,
  children,
}: {
  change: boolean;
  children: ReactElement;
}): ReactElement {
  const [theTheme, setTheme] = useAtom(ThemeAtom);
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;
  if (change && theTheme === 'light') {
    setTimeout(() => setTheme('dark'), 0);
  }
  return <FluentProvider theme={theme}>{children}</FluentProvider>;
}

function JotaiProvider({
  children,
  change,
}: {
  children: ReactElement;
  change?: boolean;
}): ReactElement {
  const store = getStore();
  return (
    <Provider store={store}>
      <FluentFixture change={change!!}>{children}</FluentFixture>
    </Provider>
  );
}

beforeEach(async () => {
  // Execute the localStorage clear function within the test environment
  // This approach is common when using test runners that control a browser context
  await window.localStorage.clear();
  // ClearCache();
});

describe('Simplest UI validation', () => {
  test('Themes & colors', async () => {
    const store = getStore();
    render(
      <JotaiProvider>
        <div />
      </JotaiProvider>,
    );
    expect(store.get(ThemeAtom)).toEqual('dark');
    await waitFor(() => {});
    expect(store.get(ThemeAtom)).toEqual('dark');
    render(
      <JotaiProvider change={true}>
        <div />
      </JotaiProvider>,
    );
    const beforeColors = store.get(ColorsAtom);
    expect(beforeColors).toBe(lightOnBlack);
    expect(store.get(ThemeAtom)).toEqual('dark');
    await waitFor(() => {
      expect(store.get(ThemeAtom)).toEqual('dark');
    });
    expect(store.get(ColorsAtom)).toBe(lightOnBlack);
    // for (let i = 0; i < lightOnBlack.length * 2; i++) {
    //   const color = store.get(ColorForNumber(i));
    //   expect(color).toBe(lightOnBlack[i % lightOnBlack.length]);
    // }
  });
  test.skip('File/Path Selection Atoms', async () => {
    globalThis.fetch = MyFetchFunc;
    const store = getStore();
    await act(async () => {
      render(
        <JotaiProvider>
          <PathSelector />
        </JotaiProvider>,
      );
    });
    // Need to cover Paths & Teams atoms
    let open = screen.getByText(Strings.select_a_bot);
    expect(open).toBeEnabled();
    let path = screen.getByText(Strings.select_a_file);
    expect(path).toBeDisabled();
    await act(async () => fireEvent.click(open));
    let select = screen.getByText('team2');
    expect(select).toBeEnabled();
    await act(async () => fireEvent.click(select));
    await waitFor(async () => {
      expect(await store.get(SelectedTeamAtom)).toBe('team2' as Team);
    });
    await waitFor(async () => {
      expect(await store.get(SelectedPathAtom)).toBe('' as Path);
    });
    // The second menu should now be enabled
    expect(path).toBeEnabled();
    await act(async () => fireEvent.click(path));
    // This is where I'm stuck, now (this doesn't work yet)
    let selectFile = screen.getByText('path3.java');
    expect(selectFile).toBeDefined();
    expect(selectFile).toBeEnabled();
    await act(async () => fireEvent.click(selectFile));
    await waitFor(async () => {
      expect(await store.get(SelectedPathAtom)).toBe('path3.java' as Path);
    });
    await act(async () => {
      await store.set(SelectedTeamAtom, 'team3');
    });
    await act(async () => {
      expect(await store.get(PathsForSelectedTeamAtom)).toEqual([]);
    });
  });
});

describe('"Rendering doesn\'t crash" tests', () => {
  test('ValueDisplay', async () => {
    globalThis.fetch = MyFetchFunc;
    const store = getStore();
    await act(async () => {
      render(
        <JotaiProvider>
          <NamedValueList />
        </JotaiProvider>,
      );
    });
    expect(await store.get(NamedValuesAtom)).toBeDefined();
  });
  test('PoseDisplay', async () => {
    globalThis.fetch = MyFetchFunc;
    const store = getStore();
    await act(async () => {
      render(
        <JotaiProvider>
          <NamedPoseList />
        </JotaiProvider>,
      );
    });
    expect(await store.get(NamedPosesAtom)).toBeDefined();
  });
  test('CurveDisplay', async () => {
    globalThis.fetch = MyFetchFunc;
    const store = getStore();
    await act(async () => {
      render(
        <JotaiProvider>
          <NamedBezierList />
        </JotaiProvider>,
      );
    });
    expect(await store.get(NamedBeziersAtom)).toBeDefined();
  });
});

describe('SchemaAtom tests', () => {
  test('PathDataDisplay atoms', async () => {
    globalThis.fetch = MyFetchFunc;
    const store = getStore();
    await act(async () => {
      render(
        <JotaiProvider>
          <PathsDataDisplay expand={true} />
        </JotaiProvider>,
      );
    });
    await act(async () => {
      await store.set(SelectedTeamAtom, 'team2');
      await store.set(SelectedPathAtom, 'path3.java');
      await store.set(SelectedClassAtom, 'c');
    });
    await act(async () => {
      expect(await store.get(SelectedPathAtom)).toBe('path3.java' as Path);
    });
    expect(await store.get(ValuesLookupAtom)).toBeDefined();
    expect(await store.get(NamedPosesAtom)).toBeDefined();
    // expect(await store.get(MappedBeziersAtom)).toBeDefined();
    /*await act(() =>
      store.set(ValueAtomFamily('valX' as ValueName), { int: 42 }),
    );
    await waitFor(async () => {
      expect(
        (await store.get(ValuesLookupAtom)).has('valX' as ValueName),
      ).toBeTrue();
      expect(
        (await store.get(MappedPosesAtom)).has('poseX' as PoseName),
      ).toBeFalse();
    });
    await act(() =>
      store.set(PoseAtomFamily('poseX' as PoseName), {
        x: 'valX' as ValueName,
        y: 'valX' as ValueName,
      }),
    );*/
  });
});
