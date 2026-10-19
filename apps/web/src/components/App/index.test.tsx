import { render, screen } from '@testing-library/react';
import { SIGN_IN_COPY } from '../../pages/SignIn/constants';
import { App } from '.';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 401 })),
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
