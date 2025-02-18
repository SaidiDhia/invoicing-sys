import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NotepadText } from 'lucide-react';
import { useFirmManager } from '@/components/contacts/firm/hooks/useFirmManager';
import { useTranslation } from 'react-i18next';

interface FirmNotesInformation {
  className?: string;
  placeholder?: string;
  loading?: boolean;
}

const FirmNotesInformation: React.FC<FirmNotesInformation> = ({
  className,
  placeholder = '',
  loading
}) => {
  const { t } = useTranslation('contacts');
  const firmManager = useFirmManager();
  return (
    <Card className={className}>
      <CardHeader className="p-5">
        <CardTitle className="border-b pb-2">
          <div className="flex items-center">
            <NotepadText className="h-7 w-7 mr-1" />
            <Label className="text-sm font-semibold">{t('firm.attributes.notes')}</Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          isPending={loading || false}
          placeholder={placeholder}
          className="resize-none"
          value={firmManager?.notes}
          onChange={(e) => firmManager.set('notes', e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default FirmNotesInformation;
