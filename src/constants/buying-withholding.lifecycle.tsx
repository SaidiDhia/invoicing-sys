import { BUYING_WITHHOLDING_STATUS } from '@/types/withholdings/buying-withholding';
import {
  Archive,
  Check,
  Copy,
  FileCheck,
  FilePlus,
  Printer,
  Save,
  Send,
  Trash,
  X
} from 'lucide-react';

export interface BuyingWithholdingLifecycle {
  label: string;
  variant: 'default' | 'outline';
  icon: React.ReactNode;
  when: { set: (BUYING_WITHHOLDING_STATUS | undefined)[]; membership: 'IN' | 'OUT' };
}

export const WITHHOLDING_LIFECYCLE_ACTIONS: Record<string, BuyingWithholdingLifecycle> = {
  save: {
    label: 'commands.save',
    variant: 'default',
    icon: <Save className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  draft: {
    label: 'commands.draft',
    variant: 'default',

    icon: <Save className="h-5 w-5" />,
    when: { membership: 'IN', set: [undefined] }
  },
  validated: {
    label: 'commands.validate',
    variant: 'default',

    icon: <FilePlus className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [undefined, BUYING_WITHHOLDING_STATUS.Draft]
    }
  },
  invoiced: {
      label: 'commands.to_invoice',
      variant: 'default',
      icon: <FileCheck className="h-5 w-5" />,
      when: {
        membership: 'IN',
        set: [BUYING_WITHHOLDING_STATUS.Validated,BUYING_WITHHOLDING_STATUS.Invoiced]
      }
  },
  duplicate: {
    label: 'commands.duplicate',
    variant: 'default',
    icon: <Copy className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  download: {
    label: 'commands.download',
    variant: 'default',
    icon: <Printer className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  delete: {
    label: 'commands.delete',
    variant: 'default',
    icon: <Trash className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  archive: {
    label: 'commands.archive',
    variant: 'outline',
    icon: <Archive className="h-5 w-5" />,
    when: { set: [], membership: 'OUT' }
  },
  reset: {
    label: 'commands.initialize',
    variant: 'outline',
    icon: <X className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  }
};
