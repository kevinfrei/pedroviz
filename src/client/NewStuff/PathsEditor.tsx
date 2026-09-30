import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button, Input } from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { CurveRefControl } from './CurveRefs';
import { InterpRefControl } from './InterpRefs';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  toastAtom,
} from './state';

// Paths Store Editor
export function PathsEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const [, setToast] = useAtom(toastAtom);

  const paths = namedValues.paths || {};
  const keys = Object.keys(paths).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'paths' ? selected.key : keys[0] || '';
  const activePath = paths[activeKey];

  const handleAdd = () => {
    let baseName = 'newPath';
    let count = 1;
    while (paths[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      paths: {
        ...paths,
        [newKey]: {
          curves: [],
        },
      },
    });
    setSelected({ store: 'paths', key: newKey });
    setToast(`Added path "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || paths[newKey]) return;
    const oldPath = paths[oldKey];
    if (!oldPath) return;
    const newDict = { ...paths };
    newDict[newKey] = oldPath;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, paths: newDict });
    setSelected({ store: 'paths', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...paths };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, paths: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'paths', key: remaining[0] || '' });
    setToast(`Deleted path "${keyToDelete}"`);
  };

  return (
    <Group>
      {/* Left List */}
      <Panel>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            Paths Store ({Object.keys(paths).length})
          </span>
          <Button icon={<AddRegular />} onClick={handleAdd}>
            Add
          </Button>
        </div>

        <div className="relative">
          <Input
            contentBefore={<SearchRegular />}
            type="text"
            placeholder="Search paths..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 pr-1">
          {keys.length === 0 ? (
            <div className="text-center text-xs text-neutral-400 py-6">
              No paths found.
            </div>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'paths', key: k })}
                className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                  activeKey === k
                    ? 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                <span className="truncate">{k}</span>
                <span className="font-mono text-neutral-500 dark:text-neutral-400">
                  {paths[k]?.curves?.length || 0} curves
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      {/* Right Detail Editor */}
      <Panel>
        {activeKey && activePath ? (
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
                  (Path Sequence Key)
                </span>
              </div>
              <Button
                icon={<DeleteRegular />}
                onClick={() => handleDelete(activeKey)}
                title="Delete Path"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Path Sequence Curves
                </span>
                <Button
                  icon={<AddRegular />}
                  onClick={() => {
                    const curvesList = activePath.curves || [];
                    const updatedPath = {
                      ...activePath,
                      curves: [
                        ...curvesList,
                        {
                          points: [
                            {
                              X: { val: 0 },
                              Y: { val: 0 },
                              Heading: { val: 0 },
                              inRadians: false,
                            },
                          ],
                          interpolation: { reversed: false },
                        },
                      ],
                    };
                    setNamedValues({
                      ...namedValues,
                      paths: { ...paths, [activeKey]: updatedPath },
                    });
                  }}>
                  Add Curve
                </Button>
              </div>

              {(activePath.curves || []).map((cRef, cIdx) => (
                <div key={cIdx} className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      Curve Segment #{cIdx + 1}
                    </span>
                    <Button
                      icon={<DeleteRegular />}
                      onClick={() => {
                        const newCurves = activePath.curves.filter(
                          (_, i) => i !== cIdx,
                        );
                        setNamedValues({
                          ...namedValues,
                          paths: {
                            ...paths,
                            [activeKey]: { ...activePath, curves: newCurves },
                          },
                        });
                      }}
                      className="text-neutral-400 hover:text-rose-500 transition-colors"
                      title="Remove Curve Segment"
                    />
                  </div>
                  <CurveRefControl
                    label={`Segment ${cIdx + 1}`}
                    curve={cRef}
                    onChange={(newCRef) => {
                      const newCurves = [...activePath.curves];
                      newCurves[cIdx] = newCRef;
                      setNamedValues({
                        ...namedValues,
                        paths: {
                          ...paths,
                          [activeKey]: { ...activePath, curves: newCurves },
                        },
                      });
                    }}
                  />
                </div>
              ))}

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <InterpRefControl
                  label="Global Path Override Interpolator (Optional)"
                  interp={activePath.globalInterpolator || { reversed: false }}
                  onChange={(globalInterpolator) => {
                    setNamedValues({
                      ...namedValues,
                      paths: {
                        ...paths,
                        [activeKey]: { ...activePath, globalInterpolator },
                      },
                    });
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-neutral-400 text-xs">
            Select or create a path sequence to edit.
          </div>
        )}
      </Panel>
    </Group>
  );
}
