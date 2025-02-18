import { create } from 'zustand';

interface AuthManager {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  set: (attribute: keyof Omit<AuthManager, 'set'>, value: string) => void;
  reset: () => void;
}

const AuthFormDefaults: Omit<AuthManager, 'set' | 'reset'> = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const useAuthManager = create<AuthManager>((set) => ({
  ...AuthFormDefaults,
  set: (attribute: keyof Omit<AuthManager, 'set'>, value: string) => {
    set((state) => ({
      ...state,
      [attribute]: value
    }));
  },
  reset: () => {
    set(AuthFormDefaults);
  }
}));
