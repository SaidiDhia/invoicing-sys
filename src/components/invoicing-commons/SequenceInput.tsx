import React from 'react';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/types/enums/date-formats';
import { format } from 'date-fns';
import { UneditableInput } from '../ui/uneditable/uneditable-input';

interface SequenceInputProps {
  className?: string;
  prefix?: string;
  dateFormat?: DATE_FORMAT;
  value?: number;
  loading?: boolean;
}

export const SequenceInput: React.FC<SequenceInputProps> = ({
  className,
  prefix,
  dateFormat,
  value,
  loading
}) => {
  const date = dateFormat ? format(new Date(), dateFormat) : '';
  return (
    <div className={cn('flex gap-2 items-center justify-center', className)}>
      <UneditableInput
        isPending={loading}
        className="text-muted-foreground focus-visible:ring-transparent disabled:cursor-auto w-1/3"
        value={`${prefix} -`}
      />
      <UneditableInput
        isPending={loading}
        className="text-muted-foreground focus-visible:ring-transparent disabled:cursor-auto w-1/3"
        value={`${date} -`}
      />
      <UneditableInput
        className="text-muted-foreground focus-visible:ring-transparent disabled:cursor-auto w-1/3"
        isPending={loading}
        value={value}
      />
    </div>
  );
};
