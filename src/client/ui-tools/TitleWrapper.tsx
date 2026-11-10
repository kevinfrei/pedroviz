// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useState } from 'react';

import {
  Button,
  Field,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';

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
  title: string | ReactElement;
  expandable?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  children: ReactElement;
}): ReactElement {
  const wrappedStyle = useWrappedRegionStyle();
  const [isExpanded, setStateExpanded] = useState(true);
  const setIsExpanded = (expanded: boolean) => {
    setStateExpanded(expanded);
    if (onExpandChange) {
      onExpandChange(expanded);
    }
  };
  const chevronStyle = {
    paddingRight: 5,
    paddingTop: -1,
    marginLeft: -5,
    cursor: 'pointer',
  };
  const header = expandable ? (
    isExpanded ? (
      <ChevronDownRegular
        style={chevronStyle}
        onClick={() => setIsExpanded(false)}
      />
    ) : (
      <ChevronRightRegular
        style={chevronStyle}
        onClick={() => setIsExpanded(true)}
      />
    )
  ) : (
    <></>
  );
  return (
    <div className={wrappedStyle.wrapper}>
      <Field
        className={wrappedStyle.field}
        label={
          <span className={wrappedStyle.label}>
            {header}
            {title}
          </span>
        }
      />
      {!expandable || isExpanded ? children : null}
    </div>
  );
}
