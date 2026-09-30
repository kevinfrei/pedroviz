import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button, Input } from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { getInterpType } from './dto_schema';
import { InterpRefControl } from './InterpRefs';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  toastAtom,
} from './state';

// Interpolators Store Editor
export function InterpolatorsEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const [, setToast] = useAtom(toastAtom);

  const interpolations = namedValues.interpolations || {};
  const keys = Object.keys(interpolations).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey =
    selected.store === 'interpolations' ? selected.key : keys[0] || '';
  const activeInterp = interpolations[activeKey];

  const handleAdd = () => {
    let baseName = 'newInterpolator';
    let count = 1;
    while (interpolations[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      interpolations: {
        ...interpolations,
        [newKey]: { reversed: false }, // TangentInterp default
      },
    });
    setSelected({ store: 'interpolations', key: newKey });
    setToast(`Added interpolator "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || interpolations[newKey]) return;
    const oldInterp = interpolations[oldKey];
    if (!oldInterp) return;
    const newDict = { ...interpolations };
    newDict[newKey] = oldInterp;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, interpolations: newDict });
    setSelected({ store: 'interpolations', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...interpolations };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, interpolations: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'interpolations', key: remaining[0] || '' });
    setToast(`Deleted interpolator "${keyToDelete}"`);
  };

  return (
    <Group>
      {/* Left List */}
      <Panel>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            Interpolators ({Object.keys(interpolations).length})
          </span>
          <Button icon={<AddRegular />} onClick={handleAdd}>
            Add
          </Button>
        </div>

        <div className="relative">
          <Input
            contentBefore={<SearchRegular />}
            type="text"
            placeholder="Search interpolators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 pr-1">
          {keys.length === 0 ? (
            <div className="text-center text-xs text-neutral-400 py-6">
              No interpolators found.
            </div>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'interpolations', key: k })}
                className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                  activeKey === k
                    ? 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                <span className="truncate">{k}</span>
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-normal">
                  {getInterpType(interpolations[k]!)}
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      {/* Right Detail Editor */}
      <Panel>
        {activeKey && activeInterp ? (
          <>
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={activeKey}
                  key={activeKey}
                  onBlur={(e) => handleRename(activeKey, e.target.value.trim())}
                  className="font-bold text-lg text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-dashed border-neutral-400 focus:border-sky-500 outline-none px-1"
                />
                <span className="text-xs text-neutral-400 font-mono">
                  (Interpolator Key)
                </span>
              </div>
              <Button
                icon={<DeleteRegular />}
                onClick={() => handleDelete(activeKey)}
                className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                title="Delete Interpolator"
              />
            </div>

            <InterpRefControl
              label="Interpolator Definition"
              interp={activeInterp}
              onChange={(updatedInterp) => {
                setNamedValues({
                  ...namedValues,
                  interpolations: {
                    ...interpolations,
                    [activeKey]: updatedInterp,
                  },
                });
              }}
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-neutral-400 text-xs">
            Select or create an interpolator to edit.
          </div>
        )}
      </Panel>
    </Group>
  );
}
