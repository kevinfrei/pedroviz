// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { InfoLabel, Link } from '@fluentui/react-components';
import { Expandable } from '@freik/fluent9-tools';

import { PathFileErrorsAtom } from './state/UserCode';

export function CodeIssues(): ReactElement {
  const errors = useAtomValue(PathFileErrorsAtom);
  return (
    <>
      {errors.length > 0 && (
        <Expandable
          label={
            <InfoLabel
              info={
                <>
                  These are errors detected from looking at the pedropaths.json
                  file in your source code repository. If you think the file is
                  fine, and there's an issue with this application, please&nbsp;
                  <Link
                    href="https://github.com/kevinfrei/pedroviz/issues"
                    target="_blank">
                    report it to the developer
                  </Link>
                  .
                </>
              }>
              File Errors
            </InfoLabel>
          }
          indent={20}>
          <div>
            <div className="code-issues">
              {errors.map((error, idx) => (
                <div key={idx} style={{ fontFamily: 'monospace' }}>
                  {error}
                </div>
              ))}
            </div>
          </div>
        </Expandable>
      )}
    </>
  );
}
