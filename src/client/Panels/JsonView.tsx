// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Text } from '@fluentui/react-components';

import { namedValuesAtom } from '../state/SymbolTable';

export function JsonView(): ReactElement {
  const namedValues = useAtomValue(namedValuesAtom);
  const json = JSON.stringify(namedValues, null, 2).split('\n');
  return (
    <div>
      <div style={{ flex: '0 0 auto' }}>
        <Text>Someday, I might make this editable...</Text>
      </div>
      {json.map((str, idx) => (
        <code
          key={idx}
          style={{
            display: 'block',
            marginLeft: (str.length - str.trimStart().length) * 10,
          }}>
          {str}
        </code>
      ))}
    </div>
  );
}
