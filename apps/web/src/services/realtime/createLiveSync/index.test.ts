import type { IChange, IChangesResponse } from '@fridgeboard/contract/changes';
import { createLiveSync } from '.';
import type { OpenChannelOptions } from '../types';

const setup = (initial: IChangesResponse = { rev: 5, snapshot: true }) => {
  const channels: { options: OpenChannelOptions; close: ReturnType<typeof vi.fn> }[] = [];
  const openChannel = vi.fn((options: OpenChannelOptions) => {
    const close = vi.fn();
    channels.push({ options, close });
    return { close };
  });
  const fetchChanges =
    vi.fn<(options: { since: number | undefined }) => Promise<IChangesResponse>>();
  fetchChanges.mockResolvedValue(initial);
  const getToken = vi.fn(async (): Promise<string | undefined> => 'token-1');
  const onChanges = vi.fn();
  const liveSync = createLiveSync({
    realtimeHost: 'rt.example.com',
    httpHost: 'http.example.com',
    householdId: 'hh-1',
    getToken,
    openChannel,
    fetchChanges,
    onChanges,
  });
  const latest = () => channels[channels.length - 1]?.options as OpenChannelOptions;
  return { liveSync, channels, latest, openChannel, fetchChanges, getToken, onChanges };
};

const change = (rev: number, type: IChange['type'] = 'item'): IChange => ({
  rev,
  type,
  id: `id-${rev}`,
});

const flush = () => vi.advanceTimersByTimeAsync(0);

const started = async (initial?: IChangesResponse) => {
  const setupResult = setup(initial);
  setupResult.liveSync.start();
  await flush();
  setupResult.latest().onSubscribed();
  await flush();
  setupResult.onChanges.mockClear();
  return setupResult;
};

describe('createLiveSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens the household channel with a fresh token', async () => {
    const { liveSync, openChannel, latest, getToken } = setup();

    liveSync.start();
    await flush();

    expect(getToken).toHaveBeenCalledOnce();
    expect(openChannel).toHaveBeenCalledOnce();
    expect(latest()).toMatchObject({
      realtimeHost: 'rt.example.com',
      httpHost: 'http.example.com',
      token: 'token-1',
      channel: '/hh/hh-1',
    });
  });

  it('learns the current rev once subscribed and refreshes everything', async () => {
    const { liveSync, latest, fetchChanges, onChanges } = setup({ rev: 5, snapshot: true });
    liveSync.start();
    await flush();

    latest().onSubscribed();
    await flush();

    expect(fetchChanges).toHaveBeenCalledWith({ since: undefined });
    expect(onChanges).toHaveBeenCalledWith([
      { type: 'item', id: undefined },
      { type: 'shop', id: undefined },
    ]);
  });

  it('applies the next change straight away', async () => {
    const { latest, fetchChanges, onChanges } = await started();

    latest().onChange(change(6, 'shop'));

    expect(onChanges).toHaveBeenCalledWith([{ type: 'shop', id: 'id-6' }]);
    expect(fetchChanges).toHaveBeenCalledOnce();
  });

  it('ignores a change it has already seen', async () => {
    const { latest, onChanges } = await started();

    latest().onChange(change(5));
    latest().onChange(change(3));

    expect(onChanges).not.toHaveBeenCalled();
  });

  it('asks the server what it missed when a change skips ahead', async () => {
    const { latest, fetchChanges, onChanges } = await started();
    fetchChanges.mockResolvedValue({ rev: 8, changes: [change(6), change(7, 'shop'), change(8)] });

    latest().onChange(change(8));
    await flush();

    expect(fetchChanges).toHaveBeenLastCalledWith({ since: 5 });
    expect(onChanges).toHaveBeenCalledWith([
      { type: 'item', id: 'id-6' },
      { type: 'shop', id: 'id-7' },
      { type: 'item', id: 'id-8' },
    ]);
  });

  it('refreshes everything when the server answers with a snapshot', async () => {
    const { latest, fetchChanges, onChanges } = await started();
    fetchChanges.mockResolvedValue({ rev: 200, snapshot: true });

    latest().onChange(change(9));
    await flush();

    expect(onChanges).toHaveBeenCalledWith([
      { type: 'item', id: undefined },
      { type: 'shop', id: undefined },
    ]);
  });

  it('catches up again when a newer change arrived while it was asking', async () => {
    const { latest, fetchChanges, onChanges } = await started();
    fetchChanges
      .mockResolvedValueOnce({ rev: 7, changes: [change(6), change(7)] })
      .mockResolvedValueOnce({ rev: 9, changes: [change(8), change(9)] });

    latest().onChange(change(7));
    latest().onChange(change(9));
    await flush();

    expect(fetchChanges).toHaveBeenCalledTimes(3);
    expect(fetchChanges).toHaveBeenLastCalledWith({ since: 7 });
    expect(onChanges).toHaveBeenCalledTimes(2);
  });

  it('carries on after a failed catch-up and tries again on the next trigger', async () => {
    const { liveSync, latest, fetchChanges, onChanges } = await started();
    fetchChanges.mockRejectedValueOnce(new Error('offline'));

    latest().onChange(change(9));
    await flush();
    expect(onChanges).not.toHaveBeenCalled();

    fetchChanges.mockResolvedValue({ rev: 9, changes: [change(9)] });
    liveSync.resume();
    await flush();

    expect(onChanges).toHaveBeenCalledWith([{ type: 'item', id: 'id-9' }]);
  });

  it('reconnects with a growing wait when the socket drops, and catches up once back', async () => {
    const { channels, latest, openChannel, fetchChanges } = await started();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    latest().onClosed();
    await vi.advanceTimersByTimeAsync(499);
    expect(openChannel).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(openChannel).toHaveBeenCalledTimes(2);

    fetchChanges.mockResolvedValue({ rev: 6, changes: [change(6)] });
    latest().onSubscribed();
    await flush();

    expect(fetchChanges).toHaveBeenLastCalledWith({ since: 5 });
    expect(channels).toHaveLength(2);
  });

  it('retries later when there is no token yet', async () => {
    const { liveSync, getToken, openChannel } = setup();
    getToken.mockResolvedValueOnce(undefined);

    liveSync.start();
    await flush();
    expect(openChannel).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(openChannel).toHaveBeenCalledOnce();
  });

  it('closes the socket and stays closed once stopped', async () => {
    const { liveSync, channels, latest, openChannel } = await started();

    liveSync.stop();
    latest().onClosed();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(channels[0]?.close).toHaveBeenCalledOnce();
    expect(openChannel).toHaveBeenCalledOnce();
  });

  it('on resume asks for what it missed and reconnects a dead socket straight away', async () => {
    const { liveSync, latest, openChannel, fetchChanges } = await started();
    latest().onClosed();

    liveSync.resume();
    await flush();

    expect(fetchChanges).toHaveBeenLastCalledWith({ since: 5 });
    expect(openChannel).toHaveBeenCalledTimes(2);
  });

  it('does nothing on resume before it has started', async () => {
    const { liveSync, fetchChanges, openChannel } = setup();

    liveSync.resume();
    await flush();

    expect(fetchChanges).not.toHaveBeenCalled();
    expect(openChannel).not.toHaveBeenCalled();
  });
});
