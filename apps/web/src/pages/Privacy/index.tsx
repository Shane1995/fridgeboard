import { PRIVACY_COPY } from './constants';

export const Privacy = () => {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-6">
      <h1 className="text-3xl font-semibold">{PRIVACY_COPY.title}</h1>
      <p>{PRIVACY_COPY.intro}</p>
      {PRIVACY_COPY.sections.map(({ heading, text }) => (
        <section key={heading} className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
      <p className="font-semibold">{PRIVACY_COPY.deletion}</p>
    </main>
  );
};
