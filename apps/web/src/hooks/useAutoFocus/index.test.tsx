import { render } from '@testing-library/react';
import { useAutoFocus } from './index';

const Field = () => {
  const ref = useAutoFocus<HTMLInputElement>();
  return <input ref={ref} aria-label="field" />;
};

const stubPointer = ({ fine }: { fine: boolean }) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: fine, media: query }));

describe('useAutoFocus', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('focuses the element when the device has a fine pointer', () => {
    stubPointer({ fine: true });
    const { getByLabelText } = render(<Field />);
    expect(getByLabelText('field')).toHaveFocus();
  });

  it('leaves the element alone on a touch device so the keyboard stays closed', () => {
    stubPointer({ fine: false });
    const { getByLabelText } = render(<Field />);
    expect(getByLabelText('field')).not.toHaveFocus();
  });

  it('does nothing when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { getByLabelText } = render(<Field />);
    expect(getByLabelText('field')).not.toHaveFocus();
  });
});
