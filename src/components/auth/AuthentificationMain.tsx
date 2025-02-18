import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import { cn } from '@/lib/utils';
import onboarding from 'src/assets/on-boarding.jpg';
import React from 'react';
import { ModeToggle } from '@/components/common/ModeToggle';
import { toast } from 'sonner';
import { useAuthManager } from './hooks/useAuthManager';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { LoginDto, RegisterDto } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { LoginSchema, RegisterSchema } from '@/types/validations/auth.validation';
import Image from 'next/image';
import LoginComponent from './LoginComponent';
import RegisterComponent from './RegisterComponent';

interface AuthenticationPageProps {
  className?: string;
}

export default function AuthenticationPage({ className }: AuthenticationPageProps) {
  const authManager = useAuthManager();
  const authContext = React.useContext(AuthContext);
  const router = useRouter();

  //login query
  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: (dto: LoginDto) => api.auth.login(dto),
    onSuccess: () => {
      toast('👋 Welcome Back!', {
        description: "We're delighted to see you again."
      });
      authContext.setAuthenticated(true);
    },
    onError: (error) => {
      toast('🫢 oops!', {
        description: getErrorMessage('', error, 'An error occurred during sign-in.')
      });
    }
  });

  //register query
  const { mutate: register, isPending: isRegistrationPending } = useMutation({
    mutationFn: (dto: RegisterDto) => api.auth.register(dto),
    onSuccess: () => {
      toast('🎯 Account Created Successfully', {
        description: 'You can now login to your account.'
      });
    },
    onError: (error) => {
      toast('🫢 oops!', {
        description: getErrorMessage('', error, 'An error occurred')
      });
    }
  });

  //login handler
  const handleLogin = () => {
    const dto: LoginDto = {
      email: authManager.email,
      password: authManager.password
    };
    const result = LoginSchema.safeParse(dto);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors).flat().join(', ');
      toast('🫢 oops!', { description: errorMessage });
    } else {
      login(dto);
    }
  };

  //register handler
  const handleRegister = () => {
    const dto: RegisterDto = {
      username: authManager.username,
      email: authManager.email,
      password: authManager.password,
      confirmPassword: authManager.confirmPassword
    };
    const result = RegisterSchema.safeParse(dto);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors).flat().join(', ');
      toast('🫢 oops!', { description: errorMessage });
    } else {
      delete dto.confirmPassword;
      register(dto);
    }
  };

  //reset form on page change or component unmount
  React.useEffect(() => {
    authManager.reset();
    if (authContext.authenticated) router.push('/');
  }, []);

  if (!authContext.authenticated)
    return (
      <div className={cn('w-full lg:grid lg:grid-cols-2 h-screen', className)}>
        <div className="relative flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>

          <div className="flex flex-col w-[500px] text-center">
            <Tabs defaultValue="sign-up" className="w-full">
              <TabsList>
                <TabsTrigger value="sign-up">Create an Account</TabsTrigger>
                <TabsTrigger value="sign-in">Already have an account?</TabsTrigger>
              </TabsList>

              <TabsContent value="sign-up">
                <RegisterComponent
                  className="m-10"
                  register={handleRegister}
                  isPending={isRegistrationPending}
                />
              </TabsContent>

              <TabsContent value="sign-in">
                <LoginComponent className="m-10" login={handleLogin} isPending={isLoginPending} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="hidden bg-muted lg:block">
          <Image
            src={onboarding}
            alt="Cover image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.4] grayscale"
          />
        </div>
      </div>
    );
}
