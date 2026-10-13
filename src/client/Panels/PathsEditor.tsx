// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom } from 'jotai';

import { Button, Text } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { isDefined } from '@freik/typechk';

import {
  NewMapAdd,
  NewMapDelete,
  NewMapRename,
  NewMapUpdate,
} from '../../DataTypeChecks';
import { InterpRef } from '../../DataTypes';
import { CurveRefControl } from '../Editors/CurveRef';
import { InterpRefControl } from '../Editors/InterpRef';
import { PathsList } from '../Lists/Paths';
import {
  DataType,
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
  const setToast = useToast();

  const activeKey = selected.get(DataType.Paths);
  const activePath = activeKey && paths.get(activeKey);

  const handleRename = (oldKey: string, newKey: string) => {
    const newMap = NewMapRename(paths, oldKey, newKey);
    if (newMap) {
      setPaths(newMap);
      setSelected(NewMapAdd(selected, DataType.Paths, newKey));
    }
  };

  const handleDelete = (keyToDelete: string) => {
    const newMap = NewMapDelete(paths, keyToDelete);
    if (newMap) {
      setPaths(newMap);
      const remaining = Array.from(newMap.keys());
      const update = remaining.length
        ? NewMapAdd(selected, DataType.Paths, remaining[0]!)
        : NewMapDelete(selected, DataType.Paths);
      if (update) {
        setSelected(update);
      }
      setToast(`Deleted path "${keyToDelete}"`);
    } else {
      setToast(`Failed to delete path "${keyToDelete}"`, 'error');
    }
  };

  return (
    <Group>
      <Panel>
        <PathsList />{' '}
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
                      item={cRef}
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
                  item={activePath.globalInterpolator}
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
