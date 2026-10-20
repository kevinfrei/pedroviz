// SPDX-License-Identifier: AGPL-3.0-or-later

import { isDefined } from '@freik/typechk';

export function NewMapAdd<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  const newMap = new Map(map);
  newMap.set(key, value);
  return newMap;
}

export function NewMapDelete<K, V>(
  map: Map<K, V>,
  key: K,
): Map<K, V> | undefined {
  if (map.has(key)) {
    const newMap = new Map(map);
    newMap.delete(key);
    return newMap;
  }
  return undefined;
}

export function NewMapRename<K, V>(
  map: Map<K, V>,
  oldKey: K,
  newKey: K,
): Map<K, V> | undefined {
  if (oldKey === newKey) {
    return undefined;
  }
  const value = map.get(oldKey);
  if (value === undefined) {
    return undefined;
  }
  const newMap = new Map(map);
  newMap.delete(oldKey);
  newMap.set(newKey, value);
  return newMap;
}

export function NewMapUpdate<K, V>(map: Map<K, V>, key: K, val: V): Map<K, V> {
  const newMap = new Map(map);
  newMap.set(key, val);
  return newMap;
}

export function RecordToMap<T>(
  obj: Record<string, T> | undefined,
): Map<string, T> {
  return new Map<string, T>(
    isDefined(obj)
      ? Object.keys(obj).map((val: string): [string, T] => [val, obj[val]!])
      : [],
  );
}
