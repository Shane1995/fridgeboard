import { act, waitFor } from '@testing-library/react';
import { BucketColor } from '../../../../../../services/shoppingList/constants';
import { testRepository } from '../../../../../../testUtils/testRepository';
import { renderHookWithHousehold } from '../../../../../../testUtils/createShoppingListWrapper';
import { useBucketForm } from './index';

const submit = (result: { current: { handleSubmit: (event: never) => void } }) =>
  act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

describe('useBucketForm', () => {
  beforeEach(() => window.localStorage.clear());

  it('creates a bucket with the trimmed name and chosen colour', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useBucketForm(undefined, onDone));

    act(() => {
      result.current.setName('  Express ');
      result.current.setColor(BucketColor.Grape);
    });
    submit(result);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(await testRepository.listBuckets()).toMatchObject([
      { name: 'Express', color: BucketColor.Grape },
    ]);
  });

  it('starts from the bucket being edited and saves the changes', async () => {
    const bucket = await testRepository.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useBucketForm(bucket, onDone));
    expect(result.current.name).toBe('Express');
    expect(result.current.color).toBe(BucketColor.Mint);

    act(() => result.current.setName('Tesco'));
    submit(result);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect((await testRepository.listBuckets())[0]?.name).toBe('Tesco');
  });

  it('deletes the bucket being edited', async () => {
    const bucket = await testRepository.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useBucketForm(bucket, onDone));

    act(() => result.current.handleDelete());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(await testRepository.listBuckets()).toEqual([]);
  });

  it('has nothing to delete when creating', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useBucketForm(undefined, onDone));

    act(() => result.current.handleDelete());

    expect(onDone).not.toHaveBeenCalled();
  });

  it('ignores a blank name', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useBucketForm(undefined, onDone));

    act(() => result.current.setName('  '));
    submit(result);

    expect(onDone).not.toHaveBeenCalled();
    expect(await testRepository.listBuckets()).toEqual([]);
  });
});
