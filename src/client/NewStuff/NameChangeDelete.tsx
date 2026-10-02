import { ReactElement } from 'react';

import { Button, Field, Input } from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';

import { useWrappedRegionStyle } from './WrappedRegionStyle';

export function NameChangeDelete({
  title,
  name,
  handleRename,
  handleDelete,
}: {
  title: string;
  name: string;
  handleRename: (oldName: string, newName: string) => void;
  handleDelete: (name: string) => void;
}): ReactElement {
  const wrappedStyle = useWrappedRegionStyle();
  return (
    <div className={wrappedStyle.wrapper}>
      <Field
        className={wrappedStyle.field}
        label={<span className={wrappedStyle.label}>{title}</span>}
      />
      <Input
        type="text"
        defaultValue={name}
        key={name}
        onBlur={(e) => handleRename(name, e.target.value.trim())}
      />
      &nbsp;
      <Button
        icon={<DeleteRegular />}
        onClick={() => handleDelete(name)}
        title={`Delete ${name}`}
      />
    </div>
  );
}
