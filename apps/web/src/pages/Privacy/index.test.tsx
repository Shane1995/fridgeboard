import { render, screen } from '@testing-library/react';
import { Privacy } from './index';
import { PRIVACY_COPY } from './constants';

describe('Privacy', () => {
  it('renders the contact address and the AWS London location', () => {
    render(<Privacy />);
    expect(screen.getAllByText(/privacy@fridgeboard\.uk/).length).toBeGreaterThan(0);
    expect(screen.getByText(/AWS London/)).toBeInTheDocument();
  });

  it('renders the deletion sentence', () => {
    render(<Privacy />);
    expect(
      screen.getByText(
        'To delete or export your data, email privacy@fridgeboard.uk and Shane will do it within a week.',
      ),
    ).toBeInTheDocument();
  });

  it('renders every section', () => {
    render(<Privacy />);
    PRIVACY_COPY.sections.forEach(({ heading }) =>
      expect(screen.getByText(heading)).toBeInTheDocument(),
    );
    expect(PRIVACY_COPY.sections).toHaveLength(8);
  });
});
