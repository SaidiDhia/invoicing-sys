import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActivityManager } from './hooks/useActivityManager';

interface ActivityFormProps {
  className?: string;
}

export const ActivityForm = ({ className }: ActivityFormProps) => {
  const activityManager = useActivityManager();
  return (
    <div className={className}>
      <div className="mt-4">
        <Label>Titre(*)</Label>
        <Input
          className="mt-2"
          placeholder="Ex. Service"
          name="label"
          value={activityManager?.label}
          onChange={(e) => {
            activityManager.set('label', e.target.value);
          }}
        />
      </div>
    </div>
  );
};
