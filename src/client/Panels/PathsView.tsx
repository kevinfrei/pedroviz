// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { isDefined, isUndefined } from '@freik/typechk';

import { InterpRef, Path } from '../../dataTypes';
import { NewMapUpdate } from '../../helpers';
import { CurveRefEditor } from '../Editors/CurveRefEditor';
import { InterpRefEditor } from '../Editors/InterpRefEditor';
import { PathsList } from '../Lists/PathsList';
import {
  DataType,
  selectedItemKeyFamily,
  symbolTablePathsAtom,
} from '../state/SymbolTable';
import { ItemEditor } from '../ui-tools/ItemEditorWrapper';
import { TitleWrapper } from '../ui-tools/TitleWrapper';

// Paths Store Editor
export function PathsView(): ReactElement {
  const [paths, setPaths] = useAtom(symbolTablePathsAtom);
  const activeKey = useAtomValue(selectedItemKeyFamily(DataType.Paths));
  const activePath = isUndefined(activeKey) ? undefined : paths.get(activeKey);

  return (
    <>
      <PathsList />

      <ItemEditor
        open={!!activePath}
        name={activeKey || ''}
        type={DataType.Paths}
        items={paths}
        setItems={setPaths}>
        <TitleWrapper title="Path Curves/Lines">
          <>
            <Button
              icon={<AddRegular />}
              onClick={() => {
                const curvesList = activePath?.curves || [];
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
                setPaths(NewMapUpdate(paths, activeKey!, updatedPath));
              }}>
              Add Curve
            </Button>
            {(activePath?.curves || []).map((cRef, cIdx) => (
              <div key={cIdx}>
                <CurveRefEditor
                  label={
                    <>
                      Segment {cIdx + 1}
                      <Button
                        title="Remove Curve Segment"
                        appearance="transparent"
                        style={{
                          marginLeft: '3px',
                          marginTop: '-3px',
                          marginRight: '-5px',
                        }}
                        icon={<DeleteRegular />}
                        onClick={() => {
                          const newCurves = (activePath?.curves || []).filter(
                            (_, i) => i !== cIdx,
                          );
                          setPaths(
                            NewMapUpdate(paths, activeKey!, {
                              ...activePath,
                              curves: newCurves,
                            }),
                          );
                        }}
                      />
                    </>
                  }
                  item={cRef}
                  onChange={(newCRef) => {
                    const newCurves = [...(activePath?.curves || [])];
                    newCurves[cIdx] = newCRef;
                    setPaths(
                      NewMapUpdate(paths, activeKey!, {
                        ...activePath,
                        curves: newCurves,
                      }),
                    );
                  }}
                />
              </div>
            ))}
            <InterpRefEditor
              label="Path-wide Interpolator (Optional)"
              showNone={true}
              item={activePath?.globalInterpolator}
              onChange={(globalInterpolator: InterpRef | null) => {
                const val = { ...activePath } as Path;
                if (globalInterpolator === null) {
                  if (isDefined(val.globalInterpolator)) {
                    delete val.globalInterpolator;
                  }
                } else {
                  val.globalInterpolator = globalInterpolator;
                }
                setPaths(NewMapUpdate(paths, activeKey!, val));
              }}
            />
          </>
        </TitleWrapper>
      </ItemEditor>
    </>
  );
}
