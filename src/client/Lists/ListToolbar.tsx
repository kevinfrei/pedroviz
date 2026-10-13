import { ReactElement, useState } from 'react';
import { SetStateAction } from 'node_modules/jotai/dist';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';

//  <ListToolbar count={values.size} add={handleAdd} name="Value"/>

type ListToolbarProps = {
  name: string;
  plural?: string;
  count: number;
  add: () => void;
  searchState: [string, (str: string) => void];
};
export function ListToolbar({
  name,
  plural,
  count,
  add,
  searchState,
}: ListToolbarProps): ReactElement {
  const names = plural || name + 's';
  const [search, setSearch] = searchState;
  return (
    <Toolbar>
      <Input
        type="text"
        contentBefore={<SearchRegular />}
        value={search}
        placeholder={`Search ${names}`}
        onChange={(_, d) => setSearch(d.value)}
      />
      <Text>
        ({count} {names} )
      </Text>
      <ToolbarButton onClick={add} icon={<AddRegular />}>
        Create {name}
      </ToolbarButton>
    </Toolbar>
  );
}
