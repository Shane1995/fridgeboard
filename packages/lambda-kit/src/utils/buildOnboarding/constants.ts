export enum OnboardingSectionId {
  Username = 'username',
  Household = 'household',
  NeedsInvite = 'needs-invite',
}

export const SKIPPABLE_SECTIONS: ReadonlySet<OnboardingSectionId> = new Set([
  OnboardingSectionId.Household,
]);
