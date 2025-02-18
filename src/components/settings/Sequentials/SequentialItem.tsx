import { DATE_FORMAT } from '@/types/enums/date-formats';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateSequentialDto } from '@/types';

interface SequentialItemProps {
  className?: string;
  id?: number;
  title: string;
  prefix?: string;
  dynamicSequence?: DATE_FORMAT;
  nextNumber?: number;
  loading?: boolean;
  onSequenceChange?: (fieldname: keyof UpdateSequentialDto, value: any) => void;
}

export const SequentialItem: React.FC<SequentialItemProps> = ({
  className,
  title,
  prefix,
  dynamicSequence,
  nextNumber,
  loading,
  onSequenceChange
}) => {
  const { t: tSettings } = useTranslation('settings');

  const sequenceOptions = {
    [DATE_FORMAT.yyyy]: 'yyyy',
    [DATE_FORMAT.yy_MM]: 'yy-MM',
    [DATE_FORMAT.yyyy_MM]: 'yyyy-MM'
  };

  return (
    <Card className={cn('border-none', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label className="text-sm my-1">{tSettings('sequence.attributes.prefix')} :</Label>
          <Input
            isPending={loading}
            value={prefix}
            onChange={(e) => {
              onSequenceChange?.('prefix', e.target.value);
            }}
          />
        </div>
        <div className="mt-4">
          <Label className="text-sm my-1">
            {tSettings('sequence.attributes.dynamic_sequence')} :
          </Label>
          <Select
            value={sequenceOptions[dynamicSequence || DATE_FORMAT.yyyy]}
            onValueChange={(value) => {
              onSequenceChange?.('dynamicSequence', value);
            }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sequenceOptions).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Label className="text-sm my-1">{tSettings('sequence.attributes.next')} :</Label>
          <Input
            type="number"
            isPending={loading}
            value={nextNumber}
            onChange={(e) => {
              onSequenceChange?.('next', parseInt(e.target.value));
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
