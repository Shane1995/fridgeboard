export type PnpmLicenseEntry = {
  name: string;
  versions: string[];
  paths: string[];
  license: string;
  homepage?: string;
};

export type PnpmLicenses = Record<string, PnpmLicenseEntry[]>;

export type ShippedPackage = {
  name: string;
  version: string;
  license: string;
  path: string;
  homepage?: string;
};

export type Notice = Omit<ShippedPackage, 'path'> & {
  text: string;
};
