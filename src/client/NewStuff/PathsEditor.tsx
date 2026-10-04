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

import { NameChangeDelete } from '../ui-tools/NameChangeDelete';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { CurveRefControl } from './CurveRefs';
import { InterpRefControl } from './InterpRefs';
import { useToast } from './NotificationToast';
import {
  searchFilterAtom,
  selectedKeyAtom,
  symbolTableAtom,
  symbolTablePathsAtom,
} from './state';

// Paths Store Editor
export function PathsEditor(): ReactElement {
  const [symbolTable, setSymbolTable] = useAtom(symbolTableAtom);
  const [paths, setPaths] = useAtom(symbolTablePathsAtom);
  const [selected, setSelected] = useAtom(selectedKeyAtom);
  const [search, setSearch] = useAtom(searchFilterAtom);
  const setToast = useToast();

  const searchLower = search.toLowerCase();
  const keys = Array.from(paths.keys()).filter((k) =>
    k.toLowerCase().includes(searchLower),
  );

  const activeKey = selected.store === 'paths' ? selected.key : keys[0] || '';
  const activePath = paths.get(activeKey);

  const handleAdd = () => {
    let baseName = 'newPath';
    let count = 1;
    while (paths.has(`${baseName}${count}`)) count++;
    const newKey = `${baseName}${count}`;
    setPaths({
      ...paths,
      [newKey]: {
        curves: [],
      },
    });
    setSelected({ store: 'paths', key: newKey });
    setToast(`Added path "${newKey}"`);
  };

  const handleRename = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey || paths.has(newKey)) return;
    const oldPath = paths.get(oldKey);
    if (!oldPath) return;
    const newDict = new Map(paths);
    newDict.set(newKey, oldPath);
    newDict.delete(oldKey);

    setSymbolTable({ ...symbolTable, paths: newDict });
    setSelected({ store: 'paths', key: newKey });
  };

  const handleDelete = (keyToDelete: string) => {
    const newDict = new Map(paths);
    newDict.delete(keyToDelete);
    setPaths(newDict);

    const remaining = Array.from(newDict.keys());
    setSelected({ store: 'paths', key: remaining[0] || '' });
    setToast(`Deleted path "${keyToDelete}"`);
  };

  return (
    <Group>
      <Panel>
        <Toolbar>
          <Text>Paths ({Object.keys(paths).length})</Text>
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
                <span>{k}</span>
                <Text>{`${paths.get(k)?.curves.length} curves`}</Text>
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
                    setSymbolTable({
                      ...symbolTable,
                      paths: { ...paths, [activeKey]: updatedPath },
                    });
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
                          setSymbolTable({
                            ...symbolTable,
                            paths: {
                              ...paths,
                              [activeKey]: { ...activePath, curves: newCurves },
                            },
                          });
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
                        setSymbolTable({
                          ...symbolTable,
                          paths: {
                            ...paths,
                            [activeKey]: { ...activePath, curves: newCurves },
                          },
                        });
                      }}
                    />
                  </div>
                ))}

                <div>
                  <InterpRefControl
                    label="Global Path Override Interpolator (Optional)"
                    interp={
                      activePath.globalInterpolator || { reversed: false }
                    }
                    onChange={(globalInterpolator) => {
                      setSymbolTable({
                        ...symbolTable,
                        paths: {
                          ...paths,
                          [activeKey]: { ...activePath, globalInterpolator },
                        },
                      });
                    }}
                  />
                </div>
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
