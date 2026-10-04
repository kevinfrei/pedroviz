// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';

import { Button, Input } from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';

import { TitleWrapper } from './TitleWrapper';

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
  return (
    <TitleWrapper title={title}>
      <>
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
      </>
    </TitleWrapper>
  );
}
