import { fireEvent, screen, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../services/session/constants';
import { createSession } from '../../../../testUtils/createSession';
import { renderInRouter } from '../../../../testUtils/renderInRouter';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { SIGN_OUT_COPY } from './constants';
import { SignOutButton } from '.';

const { session, signOut } = createSession(SessionStatus.SignedIn);

describe('SignOutButton', () => {
  beforeEach(() => {
    signOut.mockReset();
    signOut.mockResolvedValue(undefined);
  });

  it('signs the user out when pressed', async () => {
    await renderInRouter(
      <TestProviders session={session}>
        <main>
          <SignOutButton />
        </main>
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole('button', { name: SIGN_OUT_COPY.button }));

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  });
});
