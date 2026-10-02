import { ReactElement } from 'react';

import { Field } from '@fluentui/react-components';

import { useWrappedRegionStyle } from './WrappedRegionStyle';

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
