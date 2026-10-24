import { PRIVACY_COPY } from './constants';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';

export const Privacy = () => {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-6">
      <Typography variant={TypographyVariant.Heading1}>{PRIVACY_COPY.title}</Typography>
      <Typography>{PRIVACY_COPY.intro}</Typography>
      {PRIVACY_COPY.sections.map(({ heading, text }) => (
        <section key={heading} className="flex flex-col gap-1">
          <Typography variant={TypographyVariant.Heading3} as="h2">
            {heading}
          </Typography>
          <Typography>{text}</Typography>
        </section>
      ))}
      <Typography variant={TypographyVariant.Strong} as="p">
        {PRIVACY_COPY.deletion}
      </Typography>
    </main>
  );
};
