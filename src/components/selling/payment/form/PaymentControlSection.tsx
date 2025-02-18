import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface PaymentControlSectionProps {
  className?: string;
  isDataAltered?: boolean;
  handleSubmit?: () => void;
  reset: () => void;
  loading?: boolean;
}

export const PaymentControlSection = ({
  className,
  isDataAltered,
  handleSubmit,
  reset,
  loading
}: PaymentControlSectionProps) => {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');

  return (
    <div className={className}>
      <div className="flex flex-col w-full gap-2">
        <Button className="flex items-center" onClick={handleSubmit}>
          <Save className="h-5 w-5" />
          <span className="mx-1">{tCommon('commands.save')}</span>
        </Button>
        <Button className="flex items-center" variant={'outline'} onClick={reset}>
          <Save className="h-5 w-5" />
          <span className="mx-1">{tCommon('commands.initialize')}</span>
        </Button>
      </div>
    </div>
  );
};
