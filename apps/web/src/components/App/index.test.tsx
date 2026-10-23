import { render, screen } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../pages/SignIn/constants';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { App } from '.';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) =>
        input === '/configuration.json'
          ? new Response(JSON.stringify(TEST_WEB_CONFIGURATION))
          : new Response(null, { status: 401 }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a signed-out visitor to the sign-in screen', async () => {
    render(<App />);
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
  });
});
