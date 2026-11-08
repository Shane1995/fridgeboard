export const parseGroups = (claim: unknown): string[] => {
  if (Array.isArray(claim)) {
    return claim.filter((group): group is string => typeof group === 'string');
  }
  if (typeof claim !== 'string') {
    return [];
  }
  return claim
    .replace(/^\[|\]$/g, '')
    .split(/[\s,]+/)
    .filter((group) => group !== '');
};
