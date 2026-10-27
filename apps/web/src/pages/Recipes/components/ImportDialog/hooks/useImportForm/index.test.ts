import { act, renderHook } from '@testing-library/react';
import { useImportForm } from '.';

const submit = () => ({ preventDefault: vi.fn() }) as never;

const setup = () => {
  const onImport = vi.fn();
  const onDone = vi.fn();
  const hook = renderHook(() => useImportForm({ onImport, onDone }));
  return { ...hook, onImport, onDone };
};

describe('useImportForm', () => {
  it('ignores an empty submit', () => {
    const { result, onImport } = setup();
    act(() => result.current.handleSubmit(submit()));
    expect(onImport).not.toHaveBeenCalled();
  });

  it('rejects a plain http link and clears the error on edit', () => {
    const { result, onImport } = setup();
    act(() => result.current.handleChange({ value: 'http://example.com/x' }));
    act(() => result.current.handleSubmit(submit()));
    expect(onImport).not.toHaveBeenCalled();
    expect(result.current.error).toBeDefined();

    act(() => result.current.handleChange({ value: 'https://example.com/x' }));
    expect(result.current.error).toBeUndefined();
  });

  it('imports a trimmed source and closes', () => {
    const { result, onImport, onDone } = setup();
    act(() => result.current.handleChange({ value: '  https://example.com/x  ' }));
    act(() => result.current.handleSubmit(submit()));
    expect(onImport).toHaveBeenCalledWith({ source: 'https://example.com/x' });
    expect(onDone).toHaveBeenCalled();
  });
});
