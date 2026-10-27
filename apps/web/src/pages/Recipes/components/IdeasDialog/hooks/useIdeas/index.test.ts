import { act, renderHook } from '@testing-library/react';
import { useIdeas } from '.';

const search = () => ({ preventDefault: vi.fn() }) as never;

const setup = () => {
  const onImport = vi.fn();
  const onDone = vi.fn();
  const hook = renderHook(() => useIdeas({ onImport, onDone }));
  return { ...hook, onImport, onDone };
};

describe('useIdeas', () => {
  it('has no results until a search', () => {
    const { result } = setup();
    expect(result.current.ideas).toEqual([]);
  });

  it('searches, ticks and imports only the ticked ideas', () => {
    const { result, onImport, onDone } = setup();
    act(() => result.current.setPrompt('chocolate dessert'));
    act(() => result.current.handleSearch(search()));
    expect(result.current.ideas).toHaveLength(5);

    const [first, second] = result.current.ideas;
    act(() => result.current.toggle({ id: first?.id ?? '' }));
    act(() => result.current.toggle({ id: second?.id ?? '' }));
    act(() => result.current.toggle({ id: second?.id ?? '' }));
    expect(result.current.ticked).toEqual([first?.id]);

    act(() => result.current.importSelected());
    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport).toHaveBeenCalledWith({ source: first?.url });
    expect(onDone).toHaveBeenCalled();
  });

  it('clears ticks on a new search', () => {
    const { result } = setup();
    act(() => result.current.setPrompt('chicken'));
    act(() => result.current.handleSearch(search()));
    act(() => result.current.toggle({ id: result.current.ideas[0]?.id ?? '' }));
    act(() => result.current.handleSearch(search()));
    expect(result.current.ticked).toEqual([]);
  });
});
