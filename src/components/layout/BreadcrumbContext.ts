import React from 'react';

export type BreadcrumbRoute = { title: string; href?: string };

export const BreadcrumbContext = React.createContext({
  routes: [] as BreadcrumbRoute[],
  setRoutes: (routes: BreadcrumbRoute[]) => {}
});

export const useBreadcrumb = () => React.useContext(BreadcrumbContext);
