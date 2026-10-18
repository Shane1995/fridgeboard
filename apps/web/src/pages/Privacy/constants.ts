export const PRIVACY_COPY = {
  title: 'Privacy notice',
  intro: 'A plain-English summary of how Fridgeboard handles your data under UK GDPR.',
  sections: [
    {
      heading: 'Who',
      text: 'Shane runs Fridgeboard and is the controller of your data. Contact: privacy@fridgeboard.uk.',
    },
    {
      heading: "What's stored",
      text: 'Your email, your household names and members, and list items. Shifts and recipes will be added later.',
    },
    {
      heading: 'Why',
      text: 'To run the app for you and your household (legitimate interests, or contract).',
    },
    {
      heading: 'Where',
      text: 'Your data is stored in AWS London. Cloudflare handles DNS and email forwarding only.',
    },
    {
      heading: 'How long',
      text: 'Until you ask for deletion. Expired invites are removed after 7 days, and backups roll off within 35 days.',
    },
    {
      heading: "What isn't done",
      text: 'No tracking, no ads, no analytics and no sharing of your data.',
    },
    {
      heading: 'Your rights',
      text: 'You can ask for access to or an export of your data, deletion, or correction, and you can complain to the ICO.',
    },
    {
      heading: 'How deletion works',
      text: 'Shane deletes your data on request, normally within a week.',
    },
  ],
  deletion:
    'To delete or export your data, email privacy@fridgeboard.uk and Shane will do it within a week.',
} as const;
