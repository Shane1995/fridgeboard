import { waitFor } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { HOUSEHOLD_OWNER, OWNER_OPTIONS } from '../../constants';
import { useOwners } from '.';

const API_ON = { flags: { [WebFeatureFlag.ENABLE_CALENDAR_API]: true } };

describe('useOwners', () => {
  it('offers the dummy owners while the API flag is off', async () => {
    const { result, apiFetch } = await renderHookWithHousehold(() => useOwners());

    expect(result.current).toBe(OWNER_OPTIONS);
    expect(apiFetch.mock.calls.some(([{ path }]) => path.endsWith('/members'))).toBe(false);
  });

  it('offers the household and its real members while the API flag is on', async () => {
    const { result } = await renderHookWithHousehold(() => useOwners(), API_ON);

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current[0]).toBe(HOUSEHOLD_OWNER);
    expect(result.current[1]).toMatchObject({ id: 'sub-1', name: 'shane' });
  });

  it('gives each member a colour that is not the household colour', async () => {
    const { result } = await renderHookWithHousehold(() => useOwners(), API_ON);

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current[1]?.color).not.toBe(HOUSEHOLD_OWNER.color);
  });
});
