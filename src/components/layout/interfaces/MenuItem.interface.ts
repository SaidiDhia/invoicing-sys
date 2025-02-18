import React from 'react';

export interface IMenuItem {
  id?: number;
  code: string;
  title: string;
  href?: string;
  icon: React.ReactNode;
  subMenu?: Omit<IMenuItem, 'subMenu'>[];
}
