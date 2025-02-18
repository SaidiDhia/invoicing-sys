import React from 'react';
import { AppProps } from 'next/app';
import { Layout } from './layout';
import { IMenuItem } from '@/components/layout/interfaces/MenuItem.interface';
import { useTranslation } from 'react-i18next';
import { Spinner } from './common';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthContext } from '@/context/AuthContext';
import AuthenticationPage from './auth/AuthentificationMain';

interface ApplicationProps {
  className?: string;
  Component: React.ComponentType<AppProps>;
  pageProps: AppProps;
  items: IMenuItem[];
}

function Application({ Component, pageProps, items }: ApplicationProps) {
  const { ready } = useTranslation();
  const { theme } = useTheme();
  const authContext = React.useContext(AuthContext);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <>
      {authContext.authenticated ? (
        <Layout className="w-full" items={items}>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <AuthenticationPage />
      )}
      <Toaster theme={theme == 'dark' ? 'dark' : 'light'} />
    </>
  );
}

export default Application;
