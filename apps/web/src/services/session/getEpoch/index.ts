import { INITIAL_EPOCH, SESSION_KEY } from '../constants';
import { sessionEpochs } from '../store';

export const getEpoch = (): number => sessionEpochs.get(SESSION_KEY) ?? INITIAL_EPOCH;
