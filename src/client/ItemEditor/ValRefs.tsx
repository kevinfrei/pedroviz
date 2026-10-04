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
  ResolvedValue,
  SymbolTable,
  ValRef,
} from '../dto_schema';
import { resolveValRef } from '../Resolvers';
import { symbolTableAtom, symbolTableValuesAtom } from '../state/SymbolTable';
import { TitleWrapper } from '../ui-tools/TitleWrapper';

// Filter out value names that would result in errors
function filterValues(
  valueKeys: string[],
  symbolTable: SymbolTable,
  ref: string | undefined,
): string[] {
  return valueKeys.filter((k) => {
    if (isUndefined(ref)) {
      return true;
    }
    if (k == ref) {
      return false;
    }
    const resolve = resolveValRef({ ref: k }, symbolTable, new Set(ref));
    return !isError(resolve);
  });
}

export type ValRefControlProps = {
  label: string;
  value: ValRef;
  ref?: string;
  onChange: (valRef: ValRef) => void;
};

// ValRef Control: Switch between Inline ({ val }) and Ref ({ ref })
export function ValRefControl({
  label,
  value,
  ref,
  onChange,
}: ValRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const valueKeys = [...useAtomValue(symbolTableValuesAtom).keys()];
  const isRef = chkRef(value);
  const resolved = resolveValRef(value, symbolTable);
  const setToRef = (toRef: boolean) => {
    if (toRef) {
      const firstKey = filterValues(valueKeys, symbolTable, ref)[0] || '';
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
            setToRef(data.value === 'ref');
          }}>
          <Radio value="val" label="Number" />
          <Radio value="ref" label="Reference" />
        </RadioGroup>
        {!isRef ? (
          <SpinButton
            precision={2}
            step={1}
            stepPage={10}
            value={chkValue(value) ? value.val : 0}
            onChange={(_, d) => onChange({ val: d.value || 0 })}
          />
        ) : (
          <>
            <span>
              <Select
                value={value?.ref || ''}
                onChange={(e, d) => onChange({ ref: d.value })}>
                <option key="$" value="" disabled>
                  Select Value Reference...
                </option>
                {filterValues(valueKeys, symbolTable, ref).map((k) => (
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
                for {value.ref}
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
