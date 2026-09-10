import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { InfoLabel, Link, Text } from '@fluentui/react-components';
import { Expandable } from '@freik/fluent9-tools';

import { ParsingErrorsAtom, UnmatchedFieldsAtom } from './state/UserCode';

export function CodeIssues(): ReactElement {
  const unmatched = useAtomValue(UnmatchedFieldsAtom);
  const parsingErrors = useAtomValue(ParsingErrorsAtom);
  return (
    <>
      {(unmatched.length === 0 && <></>) || (
        <Expandable
          label={
            <InfoLabel
              info={
                <>
                  These are fields that are defined in the code but don't fully
                  match the expected structure, so they are not included in the
                  above lists. This may be due to an issue in this application,
                  or it may be simply because your code has some 'extra' fields
                  that aren't used for PedroPathing. If you think this is an
                  issue with this application, please{' '}
                  <Link
                    href="https://github.com/kevinfrei/pedroviz/issues"
                    target="_blank">
                    report it to the developer
                  </Link>
                  .
                </>
              }>
              Unmatched Fields
            </InfoLabel>
          }
          indent={20}>
          <div>
            <div className="code-issues">
              {unmatched.map((field, idx) => (
                <div key={idx} style={{ fontFamily: 'monospace' }}>
                  {field}
                </div>
              ))}
            </div>
          </div>
        </Expandable>
      )}
      {(parsingErrors.length === 0 && <></>) || (
        <Expandable
          label={
            <InfoLabel
              info={
                <>
                  These are errors that were encountered while parsing the code.
                  This is mostly likely an issue in this application. Please{' '}
                  <Link
                    href="https://github.com/kevinfrei/pedroviz/issues"
                    target="_blank">
                    report it to the developer
                  </Link>
                  .
                </>
              }>
              Parsing Errors
            </InfoLabel>
          }
          indent={20}>
          <div>
            <div className="code-issues">
              {parsingErrors.map((field, idx) => (
                <div key={idx} style={{ fontFamily: 'monospace' }}>
                  {field}
                </div>
              ))}
            </div>
          </div>
        </Expandable>
      )}
    </>
  );
}
