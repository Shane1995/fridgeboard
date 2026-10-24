import { sendResult } from './index.ts';

const fakeResponse = () => ({ writeHead: vi.fn(), end: vi.fn() });

describe('sendResult', () => {
  it('writes status, headers, Set-Cookie and body', () => {
    const response = fakeResponse();

    sendResult(response, { statusCode: 201, headers: { a: 'b' }, cookies: ['x=1'], body: '{}' });

    expect(response.writeHead).toHaveBeenCalledWith(201, { a: 'b', 'set-cookie': ['x=1'] });
    expect(response.end).toHaveBeenCalledWith('{}');
  });

  it('defaults to an empty 200 and omits Set-Cookie without cookies', () => {
    const response = fakeResponse();

    sendResult(response, {});

    expect(response.writeHead).toHaveBeenCalledWith(200, {});
    expect(response.end).toHaveBeenCalledWith('');
  });
});
