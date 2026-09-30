import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  Field,
  Input,
  Radio,
  RadioGroup,
  Select,
  SpinButton,
} from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';
import { isUndefined } from '@freik/typechk';

import { chkErr, chkRef, chkValue, ResolvedValue, ValRef } from './dto_schema';
import { resolveValRef } from './Resolvers';
import { symbolTableAtom } from './state';

export type ValRefControlProps = {
  label: string;
  value: ValRef;
  onChange: (valRef: ValRef) => void;
};

// ValRef Control: Switch between Inline ({ val }) and Ref ({ ref })
export function ValRefControl({
  label,
  value,
  onChange,
}: ValRefControlProps): ReactElement {
  const symbolTable = useAtomValue(symbolTableAtom);
  const valueKeys = [...symbolTable.values.keys()];
  const isRef = chkRef(value);
  const resolved = resolveValRef(value, symbolTable);

  const setToRef = (toRef: boolean) => {
    if (toRef) {
      const firstKey = valueKeys[0] || '';
      onChange({ ref: firstKey });
    } else {
      onChange({ val: chkErr(resolved) ? 0 : resolved });
    }
  };

  return (
    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 transition-all">
      <Field label={label}>
        <RadioGroup
          value={isRef ? 'ref' : 'val'}
          layout="horizontal"
          onChange={(_, data) => {
            setToRef(data.value === 'ref');
          }}>
          <Radio value="val" label="Inline Value" />
          <Radio value="ref" label="Reference" />
        </RadioGroup>
      </Field>

      {!isRef ? (
        <SpinButton
          precision={2}
          step={1}
          value={chkValue(value) ? value.val : 0}
          onChange={(e, d) => onChange({ val: d.value || 0 })}
        />
      ) : (
        <>
          <span>
            <Select
              value={value?.ref || ''}
              onChange={(e, d) => onChange({ ref: d.value })}>
              <option value="" disabled>
                Select Value Reference...
              </option>
              {valueKeys.map((k) => (
                <option key={k} value={k}>
                  {k} <ValRefInline valref={symbolTable.values.get(k)} />
                </option>
              ))}
            </Select>
          </span>
          {chkErr(resolved) && (
            <div>
              <AlertFilled />
              <span>Missing reference: "{value?.ref}"</span>
            </div>
          )}
        </>
      )}

      {/* Resolved summary badge */}
      <div className="mt-2 text-right">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${
            !chkErr(resolved)
              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
          }`}>
          <span>Resolved:</span>
          <strong className="font-bold">
            <ResolvedValueInline value={resolved} />
          </strong>
        </span>
      </div>
    </div>
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
    return <>Not found</>;
  }
  const isRef = chkRef(valref);
  const title = isRef ? 'Ref' : 'Value';
  const data = isRef ? valref.ref : valref.val.toFixed(1);
  return (
    <>
      {title} <code>{data}</code>
    </>
  );
}
