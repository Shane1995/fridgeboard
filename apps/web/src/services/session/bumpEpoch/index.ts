import { SESSION_KEY } from '../constants';
import { getEpoch } from '../getEpoch';
import { sessionEpochs } from '../store';

export const bumpEpoch = (): void => {
  sessionEpochs.set(SESSION_KEY, getEpoch() + 1);
};
