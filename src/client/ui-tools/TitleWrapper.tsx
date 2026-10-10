// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';

import {
  Field,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';

const useWrappedRegionStyle = makeStyles({
  field: {
    display: 'inlineBlock',
    marginTop: '-1.3em',
    padding: '0 6px',
  },
  label: {
    backgroundColor: tokens.colorNeutralBackground1,
    paddingLeft: '0.5em',
    paddingRight: '.5em',
    fontWeight: 'bold',
  },
  wrapper: {
    marginTop: '1em',
    ...shorthands.borderWidth('1px'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor(tokens.colorNeutralForeground3),
    borderRadius: '4px',
    padding: '8px',
  },
});

export function TitleWrapper({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement {
  const wrappedStyle = useWrappedRegionStyle();
  return (
    <div className={wrappedStyle.wrapper}>
      <Field
        className={wrappedStyle.field}
        label={<span className={wrappedStyle.label}>{title}</span>}
      />
      {children}
    </div>
  );
}
