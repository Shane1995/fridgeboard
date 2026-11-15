import { buildListContext, TEST_SCOPE } from './index.ts';

describe('buildListContext', () => {
  it('carries the body as JSON, the path parameters, the query and the scope', () => {
    const context = buildListContext({
      body: { name: 'Milk' },
      pathParameters: { itemId: 'i1' },
      query: { clearby: 'all' },
    });

    expect(context.user.event.body).toBe('{"name":"Milk"}');
    expect(context.user.event.pathParameters).toEqual({ itemId: 'i1' });
    expect(context.user.event.queryStringParameters).toEqual({ clearby: 'all' });
    expect(context.scope).toEqual(TEST_SCOPE);
  });

  it('has no body unless one is given', () => {
    expect(buildListContext().user.event).not.toHaveProperty('body');
  });
});
