import { render, screen } from '@testing-library/react';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { useSessionContext } from '../../hooks/useSessionContext';
import { createSession } from '../createSession';
import { TestProviders } from '.';

const Probe = () => {
  const { status } = useSessionContext();
  const { settings } = useRemoteConfigContext();
  return <p>{`${status} ${settings.usernameMinLength}`}</p>;
};

describe('TestProviders', () => {
  it('provides the session and the default remote configuration', () => {
    render(
      <TestProviders session={createSession().session}>
        <Probe />
      </TestProviders>,
    );

    expect(screen.getByText('signed-in 3')).toBeInTheDocument();
  });
});
