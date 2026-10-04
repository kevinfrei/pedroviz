import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import {
  Button,
  Input,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { isDefined } from '@freik/typechk';

import {
  InterpRef,
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
  NewMapUpdate,
} from '../dto_schema';
import { CurveRefControl } from '../ItemEditor/CurveRefs';
import { InterpRefControl } from '../ItemEditor/InterpRefs';
import {
  searchFilterAtom,
  selectedKeyAtom,
  symbolTablePathsAtom,
} from '../state/SymbolTable';
import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { useToast } from '../ui-tools/NotificationToast';
import { TitleWrapper } from '../ui-tools/TitleWrapper';

// Paths Store Editor
export function PathsEditor(): ReactElement {
  const [paths, setPaths] = useAtom(symbolTablePathsAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();

  const lsearch = search.toLowerCase();
  const keys = Array.from(paths.keys()).filter((k) =>
    k.toLowerCase().includes(lsearch),
  );

  const activeKey = selected.store === 'paths' ? selected.key : keys[0] || '';
  const activePath = paths.get(activeKey);

  const handleAdd = () => {
    let baseName = 'newPath';
    let count = 1;
    while (paths.has(`${baseName}${count}`)) count++;
    const newKey = `${baseName}${count}`;
    setPaths(NewMapAdd(paths, newKey, { curves: [] }));
    setSelected({ store: 'paths', key: newKey });
    setToast(`Added path "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(paths, oldKey, newKey);
    if (newMap) {
      setPaths(newMap);
      setSelected({ store: 'paths', key: newKey });
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(paths, keyToDelete);
    if (newMap) {
      setPaths(newMap);
      const remaining = Array.from(newMap.keys());
      setSelected({ store: 'paths', key: remaining[0] || '' });
      setToast(`Deleted path "${keyToDelete}"`);
    } else {
      setToast(`Failed to delete path "${keyToDelete}"`, 'error');
    }
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Paths ({paths.size})</Text>
          <ToolbarButton icon={<AddRegular />} onClick={handleAdd}>
            Create Path
          </ToolbarButton>
        </Toolbar>

        <Input
          contentBefore={<SearchRegular />}
          type="text"
          placeholder="Filter paths by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          {keys.length === 0 ? (
            <Text>No paths found.</Text>
          ) : (
            keys.map((k) => (
              <div
                key={k}
                onClick={() => setSelected({ store: 'paths', key: k })}>
                <span>{k}</span>&nbsp;
                <Text>{`${paths.get(k)?.curves.length} curves/lines`}</Text>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Separator />
      <Panel>
        {activeKey && activePath ? (
          <>
            <NameChangeDelete
              title="Selected Path Name"
              name={activeKey}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
            <TitleWrapper title="Path Curves/Lines">
              <>
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
                    setPaths(NewMapUpdate(paths, activeKey, updatedPath));
                  }}>
                  Add Curve
                </Button>

                {(activePath.curves || []).map((cRef, cIdx) => (
                  <div key={cIdx}>
                    <div>
                      <span>Curve Segment #{cIdx + 1}</span>
                      <Button
                        icon={<DeleteRegular />}
                        onClick={() => {
                          const newCurves = activePath.curves.filter(
                            (_, i) => i !== cIdx,
                          );
                          setPaths(
                            NewMapUpdate(paths, activeKey, {
                              ...activePath,
                              curves: newCurves,
                            }),
                          );
                        }}
                        title="Remove Curve Segment"
                      />
                    </div>
                    <CurveRefControl
                      label={`Segment ${cIdx + 1}`}
                      curve={cRef}
                      onChange={(newCRef) => {
                        const newCurves = [...activePath.curves];
                        newCurves[cIdx] = newCRef;
                        setPaths(
                          NewMapUpdate(paths, activeKey, {
                            ...activePath,
                            curves: newCurves,
                          }),
                        );
                      }}
                    />
                  </div>
                ))}

                <InterpRefControl
                  label="Global Path Override Interpolator (Optional)"
                  showNone={true}
                  interp={activePath.globalInterpolator}
                  onChange={(globalInterpolator: InterpRef | null) => {
                    const val = { ...activePath };
                    if (globalInterpolator === null) {
                      if (isDefined(val.globalInterpolator)) {
                        delete val.globalInterpolator;
                      }
                    } else {
                      val.globalInterpolator = globalInterpolator;
                    }
                    setPaths(NewMapUpdate(paths, activeKey, val));
                  }}
                />
              </>
            </TitleWrapper>
          </>
        ) : (
          <Text>Select or create a path sequence to edit.</Text>
        )}
      </Panel>
    </Group>
  );
}
