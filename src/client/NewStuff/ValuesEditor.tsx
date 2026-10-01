import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  Button,
  Field,
  Input,
  Text,
  tokens,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { useToast } from './NotificationToast';
import { namedValuesAtom, searchFilterAtom, selectedKeyAtom } from './state';
import { ValRefControl, ValRefInline } from './ValRefs';

// Values Editor
export function ValuesEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();
  const values = namedValues.values || {};
  const keys = Object.keys(values).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'values' ? selected.key : keys[0] || '';
  const activeValue = values[activeKey];

  const handleAdd = () => {
    let baseName = 'newValue';
    let count = 1;
    while (values[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      values: { ...values, [newKey]: { val: 0.0 } },
    });
    setSelected({ store: 'values', key: newKey });
    setToast(`Added value "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || values[newKey]) return;
    const oldVal = values[oldKey];
    if (!oldVal) return;
    const newDict = { ...values };
    newDict[newKey] = oldVal;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, values: newDict });
    setSelected({ store: 'values', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...values };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, values: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'values', key: remaining[0] || '' });
    setToast(`Deleted value "${keyToDelete}"`, 'success');
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Values ({Object.keys(values).length})</Text>
          <ToolbarButton onClick={handleAdd} icon={<AddRegular />}>
            Create Value
          </ToolbarButton>
        </Toolbar>

        <Input
          type="text"
          contentBefore={<SearchRegular />}
          value={search}
          placeholder="Filter Values by name"
          onChange={(_, d) => setSearch(d.value)}
        />

        <div>
          {keys.length === 0 ? (
            <Text>No values found.</Text>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'values', key: k })}>
                <span>{k}</span>
                <span>
                  <ValRefInline valref={values[k]} />
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activeValue ? (
          <>
            <div
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: tokens.colorNeutralForeground3,
                borderRadius: 4,
                padding: 8,
                marginTop: '1em',
              }}>
              <Field
                label={
                  <span
                    style={{
                      display: 'inlineBlock',
                      marginTop: '-1.5em',
                      padding: '0 6px',
                      fontWeight: 'bold',
                      backgroundColor: tokens.colorNeutralBackground1,
                    }}>
                    Value Name
                  </span>
                }

                style={{
                  display: 'inlineBlock',
                  marginTop: '-1.3em',
                  padding: '0 6px',
                }}>
                <span>
                  <Input
                    type="text"
                    defaultValue={activeKey}
                    key={activeKey}
                    onBlur={(e) =>
                      handleRename(activeKey, e.target.value.trim())
                    }
                  />
                  &nbsp;
                  <Button
                    icon={<DeleteRegular />}
                    onClick={() => handleDelete(activeKey)}
                    title="Delete Key"
                  />
                </span>
              </Field>
            </div>
            <ValRefControl
              label="Value or Reference"
              value={activeValue}
              ref={activeKey}
              onChange={(newVal) => {
                setNamedValues({
                  ...namedValues,
                  values: { ...values, [activeKey]: newVal },
                });
              }}
            />
          </>
        ) : (
          <div>Select or create a value to edit.</div>
        )}
      </Panel>
    </Group>
  );
}
