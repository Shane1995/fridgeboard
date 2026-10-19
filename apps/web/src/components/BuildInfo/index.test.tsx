import { render, screen } from '@testing-library/react';
import { BuildInfo } from '.';

describe('BuildInfo', () => {
  it('shows the build the app was compiled from', () => {
    render(<BuildInfo />);

    expect(screen.getByText(`build ${__BUILD_SHA__}`)).toBeInTheDocument();
  });
});
