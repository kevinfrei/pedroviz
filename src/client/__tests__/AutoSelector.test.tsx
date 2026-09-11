// SPDX-License-Identifier: AGPL-3.0-or-later

/// <reference lib="dom" />

import { describe, expect, mock, test } from 'bun:test';
import { act } from 'react';

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import { AutoSelector } from '../ui-tools/AutoSelector';

import './jest-dom-types-fix.test';

// I'm *really* new to all this UI testing. These are all *terrible* tests,
// but they're a start.
describe('AutoSelector tests', () => {
  test('one item', async () => {
    const setSel = mock((val: string) => {});
    await act(() =>
      render(
        <FluentProvider theme={webLightTheme}>
          <AutoSelector
            prompt="Test"
            items={['1']}
            selected="1"
            setSelected={setSel}
          />
        </FluentProvider>,
      ),
    );
    const item = screen.getAllByRole('button');
    expect(item[0]).toBeEnabled();
    // await waitFor(() => expect(setSel).toBeCalledWith('1'));
  });

  test('two items', async () => {
    const setSel = mock((val: string) => {});
    await act(() =>
      render(
        <FluentProvider theme={webLightTheme}>
          <AutoSelector
            prompt="Test"
            items={['1', '2']}
            selected=""
            setSelected={setSel}
          />
        </FluentProvider>,
      ),
    );
    const item = screen.getAllByRole('button');
    expect(item[0]).toBeEnabled();
    await waitFor(() => expect(setSel).toBeCalledTimes(0));
  });

  test('no items', async () => {
    const setSel = mock((val: string) => {});
    await act(() =>
      render(
        <FluentProvider theme={webLightTheme}>
          <AutoSelector
            prompt="Test"
            items={[]}
            selected=""
            setSelected={setSel}
          />
        </FluentProvider>,
      ),
    );
    const items = screen.getAllByText('Test');
    // On Mac, this is 4. On Windows, it's 1. Not sure why.
    expect(items.length).toBeOneOf([2, 1]);
    expect(items[items.length - 1]).toBeDisabled();
    await waitFor(() => expect(setSel).toBeCalledTimes(0));
  });
});
