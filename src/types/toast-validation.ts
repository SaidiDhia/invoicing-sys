import { ToastPosition, TypeOptions } from 'sonner';

export interface ToastValidation {
  message: string;
  type?: TypeOptions;
  position?: ToastPosition;
}
