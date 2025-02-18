import { PagedResponse } from '@/types/response';
import { CreateUserDto, UpdateUserDto, User } from '@/types/user';
import axios from './axios';
import { USER_FILTER_ATTRIBUTES } from '@/constants/user.filter-attributes';

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = ['role']
): Promise<PagedResponse<User>> => {
  const filter = search
    ? Object.values(USER_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';
  const response = await axios.get<PagedResponse<User>>(`public/user/list?filter=${filter}`, {
    params: {
      page,
      limit: size,
      sort: `${sortKey},${order}`,
      join: relations.join(',')
    }
  });
  return response.data;
};

const create = async (createUserDto: CreateUserDto): Promise<User> => {
  const response = await axios.post<User>('public/user', createUserDto);
  return response.data;
};

const findById = async (id?: number): Promise<User> => {
  const response = await axios.get<User>(`public/user/${id}`);
  return response.data;
};

const update = async (id?: number, updateRoleDto?: UpdateUserDto): Promise<User> => {
  const response = await axios.put<User>(`public/user/${id}`, updateRoleDto);
  return response.data;
};

const deactivate = async (id?: number): Promise<User> => {
  const response = await axios.put<User>(`public/user/deactivate/${id}`);
  return response.data;
};

const activate = async (id?: number): Promise<User> => {
  const response = await axios.put<User>(`public/user/activate/${id}`);
  return response.data;
};

export const user = {
  findPaginated,
  // findAll,
  findById,
  create,
  // duplicate,
  update,
  // remove,
  deactivate,
  activate
};
