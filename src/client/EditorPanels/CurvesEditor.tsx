import { ReactElement, useState } from 'react';
import { useAtom } from 'jotai';

import {
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { isUndefined } from '@freik/typechk';

import {
  chkRef,
  CurveRef,
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
} from '../dto_schema';
import { CurveRefControl } from '../ItemEditor/CurveRefs';
import { selectedKeyAtom, symbolTableCurvesAtom } from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';

// Curves Store Editor
export function CurvesEditor(): ReactElement {
  const [curves, setCurves] = useAtom(symbolTableCurvesAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useState('');
  const setToast = useToast();
  const lsearch = search.toLowerCase();

  const keys = Array.from(curves.keys()).filter((k) =>
    k.toLowerCase().includes(lsearch),
  );

  const activeKey = selected.store === 'curves' ? selected.key : keys[0] || '';
  const activeCurve = curves.get(activeKey);

  const handleAdd = () => {
    let count = 1;
    while (curves.has(`newCurve${count}`)) count++;
    const newKey = `newCurve${count}`;

    setCurves(
      NewMapAdd(curves, newKey, {
        points: [
          {
            X: { val: 0 },
            Y: { val: 0 },
            Heading: { val: 0 },
            inRadians: false,
          },
        ],
        interpolation: { reversed: false },
      }),
    );
    setSelected({ store: 'curves', key: newKey });
    setToast(`Added curve "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(curves, oldKey, newKey);
    if (newMap) {
      setCurves(newMap);
      setSelected({ store: 'curves', key: newKey });
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(curves, keyToDelete);
    if (newMap) {
      setCurves(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected({ store: 'curves', key: remaining[0] || '' });
      setToast(`Deleted curve "${keyToDelete}"`);
    }
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Curves ({curves.size})</Text>
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
                <span>{k}</span>&nbsp;
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
                setCurves(NewMapAdd(curves, activeKey, updatedCurve));
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

function CurveRefPointCount({
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
