import { Role } from './role';
import { Upload } from './upload';

export interface UserPreferences {
  font?: string;
  theme?: string;
}

export interface User {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  role?: Role;
  roleId?: number;
  picture?: Upload;
  pictureId?: number;
  isActive?: string;
}

export interface CreateUserDto extends Omit<User, 'id' | 'role'> {
  password?: string;
}
export interface UpdateUserDto extends CreateUserDto {}

export interface ResponseContextUserDto extends Omit<User, 'role' | 'roleId'> {}
export interface UpdateContextUserDto extends Omit<User, 'id' | 'role' | 'roleId' | 'picture'> {}
