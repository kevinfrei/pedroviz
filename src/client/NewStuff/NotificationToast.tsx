import {
  Toast,
  ToastBody,
  ToastIntent,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';

import { ToastId } from '../state/BasicState';

export type SimpleToastFunc = (msg: string, intent?: ToastIntent) => void;

export function useToast(): SimpleToastFunc {
  const { dispatchToast } = useToastController(ToastId);
  return (msg: string, intent: ToastIntent = 'info') => {
    dispatchToast(
      <Toast appearance="inverted">
        <ToastTitle>{msg}</ToastTitle>
      </Toast>,
      { intent },
    );
  };
}
