import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useUserManager } from './hooks/useUserManager';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Role } from '@/types/role';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useTranslation } from 'react-i18next';

interface UserFormProps {
  className?: string;
  roles?: Role[];
  forceShowPasswordInputs?: boolean;
  loading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  className,
  roles,
  forceShowPasswordInputs = true,
  loading
}) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tSettings } = useTranslation('settings');

  const userManager = useUserManager();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showPasswordInputs, setShowPasswordInputs] = React.useState(false);

  const handleShowPasswordInputs = (checked: CheckedState) => {
    const value = showPasswordInputs ? undefined : '';
    setShowPasswordInputs(checked as boolean);
    userManager.set('password', value);
    userManager.set('confirmPassword', value);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* General information */}
      <div className="my-2 flex flex-col gap-2">
        <h1 className="text-lg my-2 font-bold">{tSettings('users.attributes.general')}</h1>
        <div className="flex flex-row gap-2">
          {/* firstName */}
          <div className="w-1/2">
            <Label>{tSettings('users.attributes.first_name')}</Label>
            <div className="mt-1">
              <Input
                placeholder="Ex. John"
                value={userManager.firstName}
                onChange={(e) => userManager.set('firstName', e.target.value)}
              />
            </div>
          </div>
          {/* lastName */}
          <div className="w-1/2">
            <Label>{tSettings('users.attributes.last_name')}</Label>
            <div className="mt-1">
              <Input
                placeholder="Ex. Doe"
                value={userManager.lastName}
                onChange={(e) => userManager.set('lastName', e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* email */}
        <div>
          <Label>{tSettings('users.attributes.email')} (*)</Label>
          <div className="mt-1">
            <Input
              type="email"
              placeholder="Ex. This is awesome!"
              value={userManager.email}
              onChange={(e) => userManager.set('email', e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        {/* dateOfBirth */}
        <div>
          <Label>{tSettings('users.attributes.date_of_birth')}</Label>
          <div className="w-full mt-2">
            <DatePicker
              className="w-full"
              value={userManager.dateOfBirth || undefined}
              onChange={(value: Date) => {
                userManager.set('dateOfBirth', value);
              }}
            />
          </div>
        </div>
      </div>
      {/* Account Information */}
      <div className="my-2 flex flex-col gap-2">
        <h1 className="text-lg mt-4 mb-2 font-bold">{tSettings('users.attributes.account')}</h1>
        {/* username */}
        <div>
          <Label>{tSettings('users.attributes.username')} (*)</Label>
          <div className="mt-1">
            <Input
              placeholder="Ex. Awesome Administrator"
              value={userManager.username}
              onChange={(e) => userManager.set('username', e.target.value)}
            />
          </div>
        </div>
        {!forceShowPasswordInputs && (
          <div className="items-top flex space-x-2 my-4">
            <Checkbox
              id="show-password-inputs"
              checked={showPasswordInputs}
              onCheckedChange={handleShowPasswordInputs}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="show-password-inputs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {tSettings('users.update_password')}
              </label>
              <p className="text-sm text-muted-foreground">
                {tSettings('users.hints.update_password_hint', {
                  name: userManager.lastName,
                  surname: userManager.firstName
                })}
              </p>
            </div>
          </div>
        )}
        {(forceShowPasswordInputs || showPasswordInputs) && (
          <div>
            <Label>{tSettings('users.attributes.password')}</Label>
            <div className="mt-1">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className="pr-10"
                  value={userManager.password}
                  onChange={(e) => userManager.set('password', e.target.value)}
                  autoComplete="new-password"
                />
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  variant={'link'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {(forceShowPasswordInputs || showPasswordInputs) && (
          <div>
            <Label>{tSettings('users.attributes.confirm_password')}</Label>
            <div className="mt-1">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pr-10"
                  value={userManager.confirmPassword}
                  onChange={(e) => userManager.set('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                <Button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant={'link'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* role */}
        <div>
          <Label>{tSettings('users.attributes.role')} (*)</Label>
          <div className="w-full mt-1">
            <Select
              onValueChange={(value) => {
                userManager.set('roleId', parseInt(value));
              }}
              value={userManager.roleId?.toString() || ''}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Role..." />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role: Partial<Role>) => (
                  <SelectItem key={role.id} value={role.id?.toString() || ''} className="mx-1">
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* require password */}
        <div className="items-top flex space-x-2 my-2">
          <Checkbox id="force-password-change" />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="force-password-change"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {tSettings('users.require_password')}
            </label>
            <p className="text-sm text-muted-foreground">
              {tSettings('users.require_password_hint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
