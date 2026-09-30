import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button, Input } from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { isUndefined } from '@freik/typechk';

import { CurveRefControl } from './CurveRefs';
import { chkRef, CurveRef } from './dto_schema';
import {
  namedValuesAtom,
  searchFilterAtom,
  selectedKeyAtom,
  toastAtom,
} from './state';

// Curves Store Editor
export function CurvesEditor(): ReactElement {
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const [, setToast] = useAtom(toastAtom);

  const curves = namedValues.curves || {};
  const keys = Object.keys(curves).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'curves' ? selected.key : keys[0] || '';
  const activeCurve = curves[activeKey];

  const handleAdd = () => {
    let baseName = 'newCurve';
    let count = 1;
    while (curves[`${baseName}${count}`]) count++;
    const newKey = `${baseName}${count}`;

    setNamedValues({
      ...namedValues,
      curves: {
        ...curves,
        [newKey]: {
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
      },
    });
    setSelected({ store: 'curves', key: newKey });
    setToast(`Added curve "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || curves[newKey]) return;
    const oldCurve = curves[oldKey];
    if (!oldCurve) return;
    const newDict = { ...curves };
    newDict[newKey] = oldCurve;
    delete newDict[oldKey];

    setNamedValues({ ...namedValues, curves: newDict });
    setSelected({ store: 'curves', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = { ...curves };
    delete newDict[keyToDelete];
    setNamedValues({ ...namedValues, curves: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'curves', key: remaining[0] || '' });
    setToast(`Deleted curve "${keyToDelete}"`);
  };

  return (
    <Group>
      {/* Left List */}
      <Panel>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            Curves Store ({Object.keys(curves).length})
          </span>
          <Button icon={<AddRegular />} onClick={handleAdd}>
            Add
          </Button>
        </div>

        <div className="relative">
          <Input
            contentBefore={<SearchRegular />}
            type="text"
            placeholder="Search curves..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 pr-1">
          {keys.length === 0 ? (
            <div className="text-center text-xs text-neutral-400 py-6">
              No curves found.
            </div>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'curves', key: k })}
                className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                  activeKey === k
                    ? 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                <span className="truncate">{k}</span>
                <span className="font-mono text-neutral-500 dark:text-neutral-400">
                  <CurveRefPointCount curveref={curves[k]} />
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      {/* Right Detail Editor */}
      <Panel>
        {activeKey && activeCurve ? (
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
                  (Curve Key)
                </span>
              </div>
              <Button
                icon={<DeleteRegular />}
                onClick={() => handleDelete(activeKey)}
                title="Delete Curve"
              />
            </div>

            <CurveRefControl
              label="Curve Definition"
              curve={activeCurve}
              onChange={(updatedCurve: CurveRef) => {
                setNamedValues({
                  ...namedValues,
                  curves: { ...curves, [activeKey]: updatedCurve },
                });
              }}
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-neutral-400 text-xs">
            Select or create a curve to edit.
          </div>
        )}
      </Panel>
    </Group>
  );
}

export function CurveRefPointCount({
  curveref,
}: {
  curveref: CurveRef | undefined;
}): ReactElement {
  if (isUndefined(curveref)) {
    return <>Not found!</>;
  }
  if (chkRef(curveref)) {
    return (
      <>
        Reference to <code>{curveref.ref}</code>
      </>
    );
  }
  return <>{curveref.points.length} pts</>;
}
