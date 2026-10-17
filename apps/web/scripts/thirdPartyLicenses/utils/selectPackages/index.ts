import type { PnpmLicenses, ShippedPackage } from '../../types.ts';

export function selectPackages(
  prod: PnpmLicenses,
  all: PnpmLicenses,
  shippedDevPackages: string[],
): ShippedPackage[] {
  const shippedDev = Object.values(all)
    .flat()
    .filter((entry) => shippedDevPackages.includes(entry.name));
  const entries = [...Object.values(prod).flat(), ...shippedDev];

  const packages = entries.flatMap((entry) =>
    entry.versions.map((version, i) => ({
      name: entry.name,
      version,
      license: entry.license,
      path: entry.paths[i] ?? entry.paths[0] ?? '',
      ...(entry.homepage ? { homepage: entry.homepage } : {}),
    })),
  );

  const unique = new Map(packages.map((p) => [`${p.name}@${p.version}`, p]));
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}
