export type Profile = {
  email: string;
  username: string | null;
  canCreateHousehold: boolean;
  skippedSections: string[];
};
