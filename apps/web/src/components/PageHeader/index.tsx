import { Link } from '@tanstack/react-router';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';
import { PAGE_HEADER_COPY } from './constants';

export const PageHeader = ({ title }: { title: string }) => {
  return (
    <header className="flex items-center gap-3">
      <Link
        to="/"
        aria-label={PAGE_HEADER_COPY.homeLabel}
        className="shrink-0 rounded-xl outline-none md:hidden"
      >
        <img src={PAGE_HEADER_COPY.logo} alt="" className="size-10 rounded-xl" />
      </Link>
      <Typography variant={TypographyVariant.PageTitle}>{title}</Typography>
    </header>
  );
};
