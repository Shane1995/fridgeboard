import type { UpdateCondition } from '../table/types.ts';
import { CURRENT_REV_VALUE, REV_ATTRIBUTE_NAME } from '../commitChange/constants.ts';
import type { RevConditionOptions } from '../commitChange/types.ts';

export const buildRevCondition = ({ current }: RevConditionOptions): UpdateCondition =>
  current === 0
    ? {
        expression: `attribute_exists(PK) AND attribute_not_exists(${REV_ATTRIBUTE_NAME})`,
        names: { [REV_ATTRIBUTE_NAME]: 'rev' },
      }
    : {
        expression: `${REV_ATTRIBUTE_NAME} = ${CURRENT_REV_VALUE}`,
        names: { [REV_ATTRIBUTE_NAME]: 'rev' },
        values: { [CURRENT_REV_VALUE]: current },
      };
