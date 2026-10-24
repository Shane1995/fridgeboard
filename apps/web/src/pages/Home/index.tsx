import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { BuildInfo } from '../../components/BuildInfo';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
import { HOME_COPY } from './constants';
import { useHome } from './hooks/useHome';

export const Home = () => {
  const { me, isSigningOut, handleSignOut } = useHome();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <Typography variant={TypographyVariant.Logo}>{HOME_COPY.title}</Typography>
      <Typography variant={TypographyVariant.Lead}>{HOME_COPY.tagline}</Typography>
      {me && (
        <Typography>
          {HOME_COPY.signedInAs} {me.username ?? me.email}
        </Typography>
      )}
      <Button isDisabled>
        <Plus aria-hidden size={18} />
        {HOME_COPY.addItem}
      </Button>
      <Button variant="secondary" onPress={handleSignOut} isPending={isSigningOut}>
        {HOME_COPY.signOut}
      </Button>
      <BuildInfo />
    </main>
  );
};
