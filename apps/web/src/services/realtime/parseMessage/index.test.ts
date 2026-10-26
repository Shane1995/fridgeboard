import { parseMessage } from '.';

const CHANGE = { rev: 7, type: 'item', id: 'abc' };

describe('parseMessage', () => {
  it('reads the connection acknowledgement with its timeout', () => {
    expect(
      parseMessage({
        data: JSON.stringify({ type: 'connection_ack', connectionTimeoutMs: 300000 }),
      }),
    ).toEqual({ type: 'connection_ack', connectionTimeoutMs: 300000 });
    expect(parseMessage({ data: JSON.stringify({ type: 'connection_ack' }) })).toEqual({
      type: 'connection_ack',
      connectionTimeoutMs: undefined,
    });
  });

  it.each(['ka', 'subscribe_success', 'subscribe_error', 'error'])('reads a %s message', (type) => {
    expect(parseMessage({ data: JSON.stringify({ type }) })).toEqual({ type });
  });

  it('reads a change whether the event arrives as a string or as an object', () => {
    expect(
      parseMessage({ data: JSON.stringify({ type: 'data', event: JSON.stringify(CHANGE) }) }),
    ).toEqual({
      type: 'data',
      change: CHANGE,
    });
    expect(parseMessage({ data: JSON.stringify({ type: 'data', event: CHANGE }) })).toEqual({
      type: 'data',
      change: CHANGE,
    });
  });

  it.each([
    ['an unknown type of change', { ...CHANGE, type: 'meal' }],
    ['a rev that is not a number', { ...CHANGE, rev: '7' }],
    ['a missing id', { rev: 7, type: 'item' }],
    ['text that is not JSON', 'not json'],
  ])('reads data with %s as having no change', (_name, event) => {
    expect(
      parseMessage({
        data: JSON.stringify({
          type: 'data',
          event: typeof event === 'string' ? event : JSON.stringify(event),
        }),
      }),
    ).toEqual({ type: 'data', change: undefined });
  });

  it.each([
    [undefined],
    [42],
    ['not json'],
    ['[]'],
    [JSON.stringify({ type: 'other' })],
    [new ArrayBuffer(1)],
  ])('ignores a message it does not know: %j', (data) => {
    expect(parseMessage({ data })).toBeUndefined();
  });
});
