import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DefaultConditionItemProps {
  className?: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}
export const DefaultConditionItem: React.FC<DefaultConditionItemProps> = ({
  className,
  title,
  value,
  onChange,
  loading
}) => {
  return (
    <Card className={cn('border-none', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={10}
          className="resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          isPending={loading}
        />
      </CardContent>
    </Card>
  );
};
