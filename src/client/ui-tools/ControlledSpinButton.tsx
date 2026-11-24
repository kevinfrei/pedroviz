// SPDX-License-Identifier: AGPL-3.0-or-later

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
      if (isNumber(data.value)) {
        onChange(data.value);
      } else if (data.displayValue !== undefined) {
        const newValue = parseFloat(data.displayValue);
        if (!Number.isNaN(newValue)) {
          onChange(newValue);
        }
      }
    },
    [onChange],
  );
}
