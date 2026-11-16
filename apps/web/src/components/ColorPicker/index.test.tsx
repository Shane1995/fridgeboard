import { fireEvent, render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { ColorPicker } from '.';

describe('ColorPicker', () => {
  it('offers every colour in a labelled group', () => {
    render(<ColorPicker label="Colour" value={ShopColor.Mint} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'Colour' });

    expect(group.querySelectorAll('button')).toHaveLength(Object.values(ShopColor).length);
  });

  it('marks the chosen colour as pressed', () => {
    render(<ColorPicker label="Colour" value={ShopColor.Mint} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: ShopColor.Mint })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: ShopColor.Sky })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('says which colour was picked', () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Colour" value={ShopColor.Mint} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: ShopColor.Sky }));

    expect(onChange).toHaveBeenCalledWith(ShopColor.Sky);
  });

  it('has no "no colour" choice unless asked for', () => {
    render(<ColorPicker label="Colour" value={ShopColor.Mint} onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Default' })).not.toBeInTheDocument();
  });

  it('offers a way back to no colour when asked, pressed while none is chosen', () => {
    const onChange = vi.fn();
    render(
      <ColorPicker label="Colour" value={undefined} onChange={onChange} noneLabel="Default" />,
    );

    const none = screen.getByRole('button', { name: 'Default' });
    expect(none).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: ShopColor.Pink }));
    expect(onChange).toHaveBeenLastCalledWith(ShopColor.Pink);

    fireEvent.click(none);
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
