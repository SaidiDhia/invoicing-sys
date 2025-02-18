import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Application from '@/components/Application';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { menuItems } from '../components/layout/MenuItems';
import { ThemeProvider } from '@/components/theme-provider';
import nextI18nextConfig from '../../next-i18next.config';
import { appWithTranslation } from 'next-i18next';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>ZC-Invoice</title>
        <meta name="description" content="ZC-Invoice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
            <Application Component={Component} pageProps={pageProps} items={menuItems} />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
};

export default appWithTranslation(App, nextI18nextConfig);
