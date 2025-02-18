import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbCommonProps {
  className?: string;
  hierarchy?: { title: string; href?: string }[];
}

export const BreadcrumbCommon = ({ className, hierarchy }: BreadcrumbCommonProps) => {
  const router = useRouter();
  const lastIndex = hierarchy ? hierarchy.length - 1 : 0;

  return (
    <Breadcrumb className={cn(className, 'my-auto')} aria-label="breadcrumb">
      <BreadcrumbList className="flex flex-wrap gap-1 sm:gap-2 items-center">
        {hierarchy?.map((item, index) => (
          <BreadcrumbItem key={index} className="flex items-center gap-1 sm:gap-2">
            {item.href ? (
              <BreadcrumbLink
                className={cn(
                  'font-semibold text-xs sm:text-sm md:text-base',
                  item.href ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={() => {
                  item.href && router.push(item.href);
                }}>
                {item.title}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="font-medium text-xs sm:text-sm md:text-base">
                {item.title}
              </BreadcrumbPage>
            )}
            {index != lastIndex && (
              <ChevronRight className={cn('w-4 h-4 sm:w-5 sm:h-5', 'text-gray-400')} />
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
