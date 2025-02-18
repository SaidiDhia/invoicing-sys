import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthManager } from './hooks/useAuthManager';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Spinner } from '../common';
import { cn } from '@/lib/utils';

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image.";

interface LoginComponentProps {
  className?: string;
  login: () => void;
  isPending: boolean;
}

export default function LoginComponent({ className, login, isPending }: LoginComponentProps) {
  const authManager = useAuthManager();
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className={cn(className)}>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Sign-In</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email and password to log in
        </p>
      </div>
      <div className="grid gap-4 mt-4">
        <div className="grid gap-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input
            placeholder="john@example.com"
            value={authManager.email}
            onChange={(e) => {
              authManager.set('email', e.target.value);
            }}
          />
        </div>
        <div className="grid gap-2 ">
          <div className="flex items-center justify-between text-left">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              value={authManager.password}
              onChange={(e) => {
                authManager.set('password', e.target.value);
              }}
            />
            <button
              onClick={togglePasswordVisibility}
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <Button className="w-full" onClick={login}>
          Sign-In
          {isPending && <Spinner className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
