import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Spinner } from '../common/Spinner';
import React from 'react';
import { useAuthManager } from './hooks/useAuthManager';
import { Eye, EyeOff } from 'lucide-react';
import PasswordStrengthBar from 'react-password-strength-bar';

export const description =
  "A sign up form with first name, last name, email and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account";

interface RegisterComponentProps {
  className?: string;
  register: () => void;
  isPending: boolean;
}

export default function RegisterComponent({
  className,
  register,
  isPending
}: RegisterComponentProps) {
  const authManager = useAuthManager();

  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn(className)}>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Sign-Up</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      {/* Username */}
      <div className="grid gap-4 mt-4">
        <div className="grid gap-2 text-left">
          <Label>Username</Label>
          <Input
            placeholder="john"
            value={authManager.username}
            onChange={(e) => {
              authManager.set('username', e.target.value);
            }}
          />
        </div>
        {/* Email */}
        <div className="grid gap-2 text-left">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={authManager.email}
            onChange={(e) => {
              authManager.set('email', e.target.value);
            }}
          />
        </div>
        {/* Password */}
        <div className="grid gap-2 text-left">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={authManager.password}
              onChange={(e) => authManager.set('password', e.target.value)}
              className="pr-10"
            />
            <Button
              onClick={togglePasswordVisibility}
              variant={'link'}
              className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {/* PasswordStrengthBar */}
          <PasswordStrengthBar password={authManager.password} minLength={1} />
        </div>
        {/* Confirm Password */}
        <div className="grid gap-2 text-left">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={authManager.confirmPassword}
            onChange={(e) => {
              authManager.set('confirmPassword', e.target.value);
            }}
          />
        </div>
        <Button className="w-full flex items-center" onClick={register}>
          Create an account {isPending && <Spinner className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
