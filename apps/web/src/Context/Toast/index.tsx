import { Toast, ToastProvider as ToastRegion, ToastQueue } from '@heroui/react';
import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { TOAST_TIMEOUT_MS } from './constants';
import { ToastContext } from './context';
import type { ToastApi, ToastContent } from './types';

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [queue] = useState(() => new ToastQueue<ToastContent>());
  const api = useMemo<ToastApi>(
    () => ({
      success: (title) => {
        queue.add({ title, variant: 'success' }, { timeout: TOAST_TIMEOUT_MS.success });
      },
      error: (title) => {
        queue.add({ title, variant: 'danger' }, { timeout: TOAST_TIMEOUT_MS.error });
      },
      confirm: ({ title, description, actions }) => {
        queue.add(
          { title, description, actions, variant: 'accent' },
          { timeout: TOAST_TIMEOUT_MS.confirm },
        );
      },
    }),
    [queue],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion queue={queue}>
        {({ toast }) => (
          <Toast toast={toast} variant={toast.content.variant}>
            <Toast.Indicator variant={toast.content.variant} />
            <Toast.Content>
              <Toast.Title>{toast.content.title}</Toast.Title>
              {toast.content.description && (
                <Toast.Description>{toast.content.description}</Toast.Description>
              )}
              {toast.content.actions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {toast.content.actions.map(({ label, onPress }) => (
                    <Toast.ActionButton
                      key={label}
                      onPress={() => {
                        onPress();
                        queue.close(toast.key);
                      }}
                    >
                      {label}
                    </Toast.ActionButton>
                  ))}
                </div>
              )}
            </Toast.Content>
            <Toast.CloseButton />
          </Toast>
        )}
      </ToastRegion>
    </ToastContext.Provider>
  );
};
