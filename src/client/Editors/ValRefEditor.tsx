// SPDX-License-Identifier: AGPL-3.0-or-later

import { Fragment, ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  Radio,
  RadioGroup,
  Select,
  SpinButton,
  Text,
} from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { isError, isUndefined } from '@freik/typechk';

import {
  chkErr,
  chkRef,
  chkValue,
  mkRef,
  mkValue,
  SymbolTable,
  ValRef,
} from '../../dataTypes';
import { resolveValRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { useSpinButtonChange } from '../ui-tools/ControlledSpinButton';
import { TitleWrapper } from '../ui-tools/TitleWrapper';
import { SimpleValRef } from './Viewers';

// Filter out value names that would result in errors
function validValuesForRef(
  valueKeys: string[],
  symbolTable: SymbolTable,
  name?: string,
): string[] {
  if (isUndefined(name)) {
    return valueKeys;
  }
  return valueKeys.filter(
    (k) =>
      k !== name &&
      !isError(resolveValRef(mkRef(k), symbolTable, new Set([name]))),
  );
}

export type ValRefEditorProps = {
  label: string;
  item: ValRef | undefined;
  name?: string;
  topLevel?: boolean;
  onChange: (valRef: ValRef) => void;
};

// ValRef Control: Switch between Inline and Ref
export function ValRefEditor({
  label,
  item,
  name,
  onChange,
  topLevel,
}: ValRefEditorProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const onSpinChange = useSpinButtonChange((val: number) =>
    onChange(mkValue(val)),
  );
  if (isUndefined(item)) {
    return <></>;
  }
  const valueKeys = [...symbolTable.values.keys()];
  const isRef = chkRef(item);
  const resolved = resolveValRef(item, symbolTable);
  const setType = (setToRef: boolean) => {
    if (setToRef) {
      const firstKey = validValuesForRef(valueKeys, symbolTable, name)[0] || '';
      onChange(mkRef(firstKey));
    } else {
      onChange(mkValue(isError(resolved) ? 0 : resolved));
    }
  };

  return (
    <TitleWrapper title={label} expandable={!topLevel}>
      <RadioGroup
        value={isRef ? 'ref' : 'val'}
        layout="horizontal"
        onChange={(_, data) => {
          setType(data.value === 'ref');
        }}>
        <Radio value="val" label="Number" />
        <Radio value="ref" label="Reference" />
      </RadioGroup>
      {!isRef ? (
        <SpinButton
          precision={2}
          step={1}
          stepPage={10}
          value={chkValue(item) ? item.val : null}
          onChange={onSpinChange}
        />
      ) : (
        <>
          <span>
            <Select
              value={item?.ref || ''}
              onChange={(e, d) => onChange(mkRef(d.value))}>
              <option key="$" value="" disabled>
                Select Value Reference...
              </option>
              {validValuesForRef(valueKeys, symbolTable, name).map((k) => (
                <option key={k} value={k}>
                  {k} <SimpleValRef valref={symbolTable.values.get(k)} />
                </option>
              ))}
            </Select>
          </span>
          {chkErr(resolved) && (
            <Text>
              <AlertFilled />
              {resolved.errors().map((e) => (
                <Fragment key={e}>
                  <Text>{e}</Text>
                  <br />
                </Fragment>
              ))}
              for {item.ref}
            </Text>
          )}
        </>
      )}
    </TitleWrapper>
  );
}
