import type { Notice } from '../../types.ts';

export const formatNotices = (notices: Notice[]): string => {
  const header = `Fridgeboard includes the following third-party software.`;
  const sections = notices.map((n) =>
    [
      `${n.name}@${n.version} (${n.license})`,
      ...(n.homepage ? [n.homepage] : []),
      '',
      n.text.trim(),
    ].join('\n'),
  );
  return [header, ...sections].join(`\n${'-'.repeat(72)}\n\n`) + '\n';
};
