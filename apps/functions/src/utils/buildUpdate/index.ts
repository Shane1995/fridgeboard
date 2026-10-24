import type { UpdateParts } from '../table/types.ts';

export const buildUpdate = ({ set = {}, add = {} }: UpdateParts) => {
  const setEntries = Object.entries(set);
  const addEntries = Object.entries(add);
  const entries = [...setEntries, ...addEntries];
  const setClause = setEntries.map((_, index) => `#a${index} = :v${index}`);
  const addClause = addEntries.map((_, index) => {
    const position = setEntries.length + index;
    return `#a${position} :v${position}`;
  });
  return {
    UpdateExpression: [
      setClause.length > 0 ? `SET ${setClause.join(', ')}` : '',
      addClause.length > 0 ? `ADD ${addClause.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' '),
    ExpressionAttributeNames: Object.fromEntries(
      entries.map(([attribute], index) => [`#a${index}`, attribute]),
    ),
    ExpressionAttributeValues: Object.fromEntries(
      entries.map(([, value], index) => [`:v${index}`, value]),
    ),
  };
};
