import { User } from '@/types';
import { create } from 'zustand';

interface UserManagerData {
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  roleId?: number;
  password?: string;
  confirmPassword?: string;
}

interface UserManager extends UserManagerData {
  set: (name: keyof UserManagerData, value: any) => void;
  reset: () => void;
  getUser: () => Partial<User>;
  setUser: (data: Partial<User>) => void;
}

const initialState: UserManagerData = {
  id: undefined,
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  dateOfBirth: new Date(),
  roleId: undefined,
  password: '',
  confirmPassword: ''
};

export const useUserManager = create<UserManager>((set, get) => ({
  ...initialState,

  set: (name: keyof UserManager, value: any) => {
    set((state) => ({
      ...state,
      [name]: value
    }));
  },

  reset: () => {
    set({ ...initialState });
  },

  getUser: () => {
    const data = get();
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth?.toString(),
      password: data.password,
      roleId: data.roleId
    };
  },

  setUser: (data: Partial<User>) => {
    set((state) => ({
      ...state,
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data?.dateOfBirth ? new Date(data?.dateOfBirth) : undefined,
      roleId: data.roleId
    }));
  }
}));
