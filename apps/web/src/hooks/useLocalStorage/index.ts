import { useCallback, useState } from 'react';
import { readLocalStorage } from '../../utils/readLocalStorage';
import { writeLocalStorage } from '../../utils/writeLocalStorage';

// State that survives a reload. Storage can be blocked (private mode); the value then lasts only
// until the page closes.
export const useLocalStorage = (
  key: string,
): [string | undefined, (value: string | undefined) => void] => {
  const [value, setValue] = useState(() => readLocalStorage(key));
  const update = useCallback(
    (next: string | undefined) => {
      writeLocalStorage(key, next);
      setValue(next);
    },
    [key],
  );
  return [value, update];
};
