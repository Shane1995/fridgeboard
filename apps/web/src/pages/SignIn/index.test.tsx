import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { createAppRouter } from '../../app/router/utils/createAppRouter';
import { startSignIn } from '../../services/session/startSignIn';
import { SIGN_IN_COPY } from './constants';

vi.mock('../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));

const renderSignIn = async () => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: ['/sign-in'] }));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return screen.findByLabelText(SIGN_IN_COPY.emailLabel);
};

const submitEmail = (input: HTMLElement) => {
  fireEvent.change(input, { target: { value: 'a@b.com' } });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.sendCode }));
};

describe('SignIn', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the no-invite copy when startSignIn returns no-invite', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: false, reason: 'no-invite' });
    submitEmail(await renderSignIn());
    expect(
      await screen.findByText(
        'No invite found for this email. Ask whoever invited you to send one.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the verify-email copy', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: false, reason: 'verify-email' });
    submitEmail(await renderSignIn());
    expect(await screen.findByText(/Open the email from Amazon Web Services/)).toBeInTheDocument();
  });

  it('moves to the code step once the code is sent', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    submitEmail(await renderSignIn());
    expect(await screen.findByLabelText(SIGN_IN_COPY.codeLabel)).toBeInTheDocument();
  });

  it('links to /privacy', async () => {
    await renderSignIn();
    expect(screen.getByRole('link', { name: SIGN_IN_COPY.privacy })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });
});
