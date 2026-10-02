import { ReactElement } from 'react';
import { useAtom, useSetAtom } from 'jotai';

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
import { chkRef } from './dto_schema';
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
  const setToast = useSetAtom(toastAtom);

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
                <Text>
                  {chkRef(paths[k])
                    ? paths[k].ref
                    : `${paths[k]?.curves.length} curves`}
                </Text>
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
                    setNamedValues({
                      ...namedValues,
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
                          setNamedValues({
                            ...namedValues,
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

                <div>
                  <InterpRefControl
                    label="Global Path Override Interpolator (Optional)"
                    interp={
                      activePath.globalInterpolator || { reversed: false }
                    }
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
