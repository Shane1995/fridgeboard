export type ToastAction = { label: string; onPress: () => void };

export type ToastContent = {
  title: string;
  description?: string | undefined;
  variant: 'success' | 'danger' | 'accent';
  actions?: ToastAction[] | undefined;
};

export type ConfirmOptions = {
  title: string;
  description?: string | undefined;
  actions: ToastAction[];
};

export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  confirm: (options: ConfirmOptions) => void;
};
