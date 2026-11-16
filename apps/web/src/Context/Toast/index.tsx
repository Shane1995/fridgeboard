import { Toast, ToastProvider as ToastRegion, ToastQueue } from '@heroui/react';
import { useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { TOAST_TIMEOUT_MS } from './constants';
import { ToastContext } from './context';
import type { ToastApi, ToastContent } from './types';

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [queue] = useState(() => new ToastQueue<ToastContent>());
  const latest = useRef<string | undefined>(undefined);
  const api = useMemo<ToastApi>(() => {
    const show = (content: ToastContent, timeout: number) => {
      if (latest.current !== undefined) {
        queue.close(latest.current);
      }
      latest.current = queue.add(content, { timeout });
    };
    return {
      success: (title, action) =>
        show(
          { title, variant: 'success', actions: action === undefined ? undefined : [action] },
          action === undefined ? TOAST_TIMEOUT_MS.success : TOAST_TIMEOUT_MS.undo,
        ),
      error: (title) => show({ title, variant: 'danger' }, TOAST_TIMEOUT_MS.error),
      confirm: ({ title, description, actions }) =>
        show({ title, description, actions, variant: 'accent' }, TOAST_TIMEOUT_MS.confirm),
    };
  }, [queue]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion queue={queue}>
        {({ toast }) => (
          <Toast
            toast={toast}
            variant={toast.content.variant}
            className="items-center rounded-2xl bg-foreground px-4 py-2.5 text-background shadow-lg"
          >
            <Toast.Indicator variant={toast.content.variant} />
            <Toast.Content
              className={
                toast.content.description
                  ? 'flex-1'
                  : 'flex-1 flex-row items-center justify-between gap-3'
              }
            >
              <Toast.Title className="text-sm font-medium text-background">
                {toast.content.title}
              </Toast.Title>
              {toast.content.description && (
                <Toast.Description className="text-background/70">
                  {toast.content.description}
                </Toast.Description>
              )}
              {toast.content.actions && (
                <div className="flex shrink-0 items-center gap-1">
                  {toast.content.actions.map(({ label, onPress }) => (
                    <Toast.ActionButton
                      key={label}
                      className="min-h-8 rounded-lg bg-white/15 px-3 text-sm font-semibold text-background hover:bg-white/25"

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
            {(toast.content.variant !== 'success' || toast.content.actions !== undefined) && (
              <Toast.CloseButton className="text-background/70 hover:text-background" />
            )}
          </Toast>
        )}
      </ToastRegion>
    </ToastContext.Provider>
  );
};
