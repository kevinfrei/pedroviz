import { describe, expect, test } from 'bun:test';
import path from 'node:path';

import {
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
  NewMapUpdate,
  RandomRange,
  RecordToMap,
} from '../../helpers';
import { GetRelativeRepoRoot, SetArgs } from '../repo-discovery';

function getTeamCodePath(): string {
  return path.resolve(__dirname, 'teamcode-repo');
}

test('Functional Map stuff', () => {
  const mp = new Map<string, string>();
  expect(mp.size).toBe(0);
  const m1 = NewMapAdd(mp, 'key', 'val');
  expect(m1.size).toBe(1);
  const m2 = NewMapAdd(m1, 'k2', 'val2');
  expect(m2.size).toBe(2);
  const m3 = NewMapDelete(m2, 'k2');
  expect(m3).toBeDefined();
  if (m3 === undefined) return;
  expect(m3.size).toBe(1);
  const und = NewMapDelete(m2, 'nope');
  expect(und).toBeUndefined();
  const ren = NewMapRename(m3, 'key', 'new');
  expect(ren).toBeDefined();
  if (ren === undefined) return;
  expect(ren.size).toBe(1);
  const failed = NewMapRename(m2, 'k2', 'key');
  expect(failed).toBeUndefined();
  const failed2 = NewMapRename(m2, 'k3', 'nk');
  expect(failed2).toBeUndefined();
  const nmu = NewMapUpdate(m2, 'k2', 'newThing');
  expect(nmu.size).toBe(2);
  const nm2 = NewMapUpdate(m2, 'k3', 'newThing');
  expect(nm2.size).toBe(3);
});

test('RecordToMap stuff', () => {
  const mp = RecordToMap<number>({ a: 1, b: 2, c: 3 });
  expect(mp.size).toBe(3);
  expect(mp.get('a')).toBe(1);
  expect(mp.get('b')).toBe(2);
  expect(mp.get('c')).toBe(3);
  const ded = RecordToMap(undefined);
  expect(ded.size).toBe(0);
});

test('Random Numbers', () => {
  for (let i = 0; i < 500; i++) {
    const val = RandomRange(5, 5);
    expect(val < 10 && val >= 0).toBeTrue();
  }
});

describe('a couple extras', () => {
  test('SetArgs', async () => {
    SetArgs([getTeamCodePath()]);
    const root = await GetRelativeRepoRoot();
    expect(root).toBe(getTeamCodePath());
  });
});
