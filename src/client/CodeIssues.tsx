import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { Text } from '@fluentui/react-components';
import { Expandable } from '@freik/fluent9-tools';

import { UnmatchedFieldsAtom } from './state/UserCode';

export function CodeIssues(): ReactElement {
  const unmatched = useAtomValue(UnmatchedFieldsAtom);
  return (
    (unmatched.length === 0 && <></>) || (
      <Expandable label="Unmatched Fields" indent={20}>
        <div>
          <Text>
            These are fields that are defined in the code but don't fully match
            the expected structure, so they are not included in the above lists.
            This may be due to an issue in this application, or it may be simply
            because your code has some 'extra' fields that aren't used for
            PedroPathing. If you think this is an issue with this application,
            please report it to the developers.
          </Text>
          <div className="code-issues">
            {unmatched.map((field, idx) => (
              <div key={idx} style={{ fontFamily: 'monospace' }}>
                {field}
              </div>
            ))}
          </div>
        </div>
      </Expandable>
    )
  );
}
