import { useCallback } from 'react';

import {
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
  SpinButtonProps,
} from '@fluentui/react-components';
import { isNumber } from '@freik/typechk';

export function useSpinButtonChange(
  onChange: (val: number) => void,
): NonNullable<SpinButtonProps['onChange']> {
  return useCallback(
    (_: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
      console.log('onSpinButtonChange', data.value, data.displayValue);
      if (isNumber(data.value)) {
        onChange(data.value);
      } else if (data.displayValue !== undefined) {
        const newValue = parseFloat(data.displayValue);
        if (!Number.isNaN(newValue)) {
          onChange(newValue);
        } // else {
        //   console.error(`Cannot parse "${data.displayValue}" as a number.`);
        // }
      }
    },
    [onChange],
  );
}
