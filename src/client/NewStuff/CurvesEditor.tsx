import { ReactElement } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { isUndefined } from '@freik/typechk';

import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { CurveRefControl } from './CurveRefs';
import { chkRef, CurveRef } from './dto_schema';
import { useToast } from './NotificationToast';
import { searchFilterAtom, selectedKeyAtom, symbolTableAtom } from './state';

// Curves Store Editor
export function CurvesEditor(): ReactElement {
  const [symbolTable, setSymbolTable] = useAtom(symbolTableAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();

  const curves = symbolTable.curves || {};
  const keys = Object.keys(curves).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKey = selected.store === 'curves' ? selected.key : keys[0] || '';
  const activeCurve = curves.get(activeKey);

  const handleAdd = () => {
    let baseName = 'newCurve';
    let count = 1;
    while (curves.has(`${baseName}${count}`)) count++;
    const newKey = `${baseName}${count}`;

    setSymbolTable({
      ...symbolTable,
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
    if (!newKey || oldKey === newKey || curves.has(newKey)) return;
    const oldCurve = curves.get(oldKey);
    if (!oldCurve) return;
    const newDict = new Map(curves);
    newDict.set(newKey, oldCurve);
    newDict.delete(oldKey);

    setSymbolTable({ ...symbolTable, curves: newDict });
    setSelected({ store: 'curves', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = new Map(curves);
    newDict.delete(keyToDelete);
    setSymbolTable({ ...symbolTable, curves: newDict });

    const remaining = Object.keys(newDict);
    setSelected({ store: 'curves', key: remaining[0] || '' });
    setToast(`Deleted curve "${keyToDelete}"`);
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Curves ({Object.keys(curves).length})</Text>
          <ToolbarButton icon={<AddRegular />} onClick={handleAdd}>
            Create Curve/Line
          </ToolbarButton>
        </Toolbar>
        <Input
          contentBefore={<SearchRegular />}
          type="text"
          placeholder="Search curves..."
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />
        <div>
          {keys.length === 0 ? (
            <Text>No curves found.</Text>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'curves', key: k })}>
                <span>{k}</span>
                <CurveRefPointCount curveref={curves.get(k)} />
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activeCurve ? (
          <>
            <NameChangeDelete
              title="Selected Curve Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <CurveRefControl
              label="Curve Definition"
              curve={activeCurve}
              onChange={(updatedCurve: CurveRef) => {
                setSymbolTable({
                  ...symbolTable,
                  curves: { ...curves, [activeKey]: updatedCurve },
                });
              }}
            />
          </>
        ) : (
          <Text>Select or create a curve to edit.</Text>
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
