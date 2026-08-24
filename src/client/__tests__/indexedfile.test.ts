// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from 'bun:test';

import '@testing-library/jest-dom';

import { BezierName } from '../../CodeTypes';
import {
  GetNameLookup,
  MakeFileIndex,
  ValidateIndex,
} from '../state/IndexedFile';
import {
  fullParsedClass,
  noParsedClass,
  testDatabase,
  TestPathsParsed,
} from './testpaths.input';

describe('IndexedFile', () => {
  test('MakeFileIndex', async () => {
    const index = MakeFileIndex(fullParsedClass);
    expect(index).toBeDefined();
    expect(index.namedValues.size).toBe(3);
    expect(index.namedPoses.size).toBe(4);
    expect(index.namedBeziers.size).toBe(2);
    expect(index.namedPathChains.size).toBe(3);
  });

  test('GetNameLookup', async () => {
    const lkup = GetNameLookup();
    expect(lkup).toBeDefined();
    expect(
      lkup.findBezier('nope' as BezierName, noParsedClass),
    ).toBeUndefined();
    // TODO: Add more tests for GetNameLookup, including scoped names to other
    // classes, and names that are not found in the current class but are found
    // in the parent class, etc...
  });

  test('ValidateIndex', async () => {
    const index = MakeFileIndex(TestPathsParsed);
    const lkup = GetNameLookup();
    lkup.setDb(testDatabase);
    const result = ValidateIndex(index, lkup);
    // if (result !== true) {
    //   console.error(result.errors());
    // }
    expect(result).toBe(true);
  });
});
