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

import { chkErr, chkRef, chkValue } from '../../DataTypeChecks';
import { SymbolTable, ValRef } from '../../DataTypes';
import { ResolvedValue } from '../ResolvedTypes';
import { resolveValRef } from '../Resolvers';
import { symbolTableAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';

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
      !isError(resolveValRef({ ref: k }, symbolTable, new Set([name]))),
  );
}

export type ValRefControlProps = {
  label: string;
  item: ValRef;
  name?: string;
  onChange: (valRef: ValRef) => void;
};

// ValRef Control: Switch between Inline ({ val }) and Ref ({ ref })
export function ValRefControl({
  label,
  item,
  name,
  onChange,
}: ValRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const valueKeys = [...symbolTable.values.keys()];
  const isRef = chkRef(item);
  const resolved = resolveValRef(item, symbolTable);
  const setType = (setToRef: boolean) => {
    if (setToRef) {
      const firstKey = validValuesForRef(valueKeys, symbolTable, name)[0] || '';
      onChange({ ref: firstKey });
    } else {
      onChange({ val: isError(resolved) ? 0 : resolved });
    }
  };

  return (
    <TitleWrapper title={label}>
      <>
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
            value={chkValue(item) ? item.val : 0}
            onChange={(_, d) => onChange({ val: d.value || 0 })}
          />
        ) : (
          <>
            <span>
              <Select
                value={item?.ref || ''}
                onChange={(e, d) => onChange({ ref: d.value })}>
                <option key="$" value="" disabled>
                  Select Value Reference...
                </option>
                {validValuesForRef(valueKeys, symbolTable, name).map((k) => (
                  <option key={k} value={k}>
                    {k} <ValRefInline valref={symbolTable.values.get(k)} />
                  </option>
                ))}
              </Select>
            </span>
            {chkErr(resolved) && (
              <Text>
                <AlertFilled />
                {resolved.errors().map((e, i) => (
                  <Fragment key={i}>
                    <Text>{e}</Text>
                    <br />
                  </Fragment>
                ))}
                for {item.ref}
              </Text>
            )}
          </>
        )}
      </>
    </TitleWrapper>
  );
}

export function ResolvedValueInline({
  value,
}: {
  value: ResolvedValue;
}): ReactElement {
  return (
    <>
      {chkErr(value) ? `Error: ${value.errors().join('\n')}` : value.toFixed(2)}
    </>
  );
}

export function ValRefInline({
  valref,
}: {
  valref?: ValRef | undefined;
}): ReactElement {
  if (isUndefined(valref)) {
    return <Text>Not found</Text>;
  }
  const isVal = chkValue(valref);
  const isRef = chkRef(valref);
  const title = isVal ? 'Value' : isRef ? 'Ref' : 'Null';
  const data = isRef ? valref.ref : isVal ? valref.val.toFixed(2) : 'null';
  return (
    <Text>
      {title}&nbsp;<code>{data}</code>
    </Text>
  );
}
