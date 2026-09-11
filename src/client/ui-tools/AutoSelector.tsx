// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ChevronDown16Regular } from '@fluentui/react-icons';

// Show a selection, or a button for only 1 item.
// If there are no items, it shows a disabled selector.
export function AutoSelector({
  id,
  prompt,
  items,
  selected,
  setSelected,
}: {
  id?: string;
  prompt: string;
  items: string[];
  selected: string;
  setSelected: (item: string) => void;
}): ReactElement {
  let selectedItem = selected.length === 0 ? prompt : selected;

  const trigger = (
    <Button
      disabled={items.length === 0}
      id={id}
      appearance={items.length === 1 ? 'subtle' : 'secondary'}>
      {selectedItem}
      <ChevronDown16Regular style={{ marginLeft: 10 }} />
    </Button>
  );

  return items.length === 1 ? (
    trigger
  ) : (
    <Menu>
      <MenuTrigger>{trigger}</MenuTrigger>
      <MenuPopover>
        <MenuList>
          {items.map((val) => (
            <MenuItem key={val} onClick={() => setSelected(val)}>
              {val}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
