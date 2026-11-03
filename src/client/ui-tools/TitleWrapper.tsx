// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';

import {
  Button,
  Field,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { ArrowDownRegular, ArrowRightRegular } from '@fluentui/react-icons';

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
  expandable,
  onExpandChange,
  children,
}: {
  title: string;
  expandable?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  children: ReactElement;
}): ReactElement {
  const wrappedStyle = useWrappedRegionStyle();
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className={wrappedStyle.wrapper}>
      {expandable && (
        <Button
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (onExpandChange) {
              onExpandChange(!isExpanded);
            }
          }}
          icon={isExpanded ? <ArrowDownRegular /> : <ArrowRightRegular />}
        />
      )}
      {(!expandable || isExpanded) && (
        <Field
          className={wrappedStyle.field}
          label={<span className={wrappedStyle.label}>{title}</span>}
        />
      )}
      {children}
    </div>
  );
}
