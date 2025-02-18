import { LoginDto, RegisterDto } from '@/types';
import axios from './axios';

// Function to save tokens in localStorage
const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Function to clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API call for login
const login = async (dto: LoginDto) => {
  const response = await axios.post('public/auth/login', dto);

  if (response.status === 200) {
    const { access_token, refresh_token } = response.data;
    saveTokens(access_token, refresh_token);
  }

  return response.data;
};

// API call for register
const register = async (dto: RegisterDto) => {
  const response = await axios.post('public/auth/register', dto);
  console.log('response:', response.data);

  return response.data;
};

// Function to refresh the access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) return;

  const response = await axios.post('public/auth/refresh-token', {
    refreshToken
  });

  if (response.status === 200 || response.status === 201) {
    const { access_token, refresh_token: newRefreshToken } = response.data;

    // Save new tokens to localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', newRefreshToken);

    return access_token; // Return the new access token
  } else {
    throw new Error('Failed to refresh token');
  }
};

// Function to log out the user
const logout = () => {
  clearTokens();
};

const isTokenValid = () => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return false;
  const payload = JSON.parse(atob(accessToken.split('.')[1]));
  const expiry = payload.exp * 1000;
  return Date.now() < expiry;
};

const getCurrentUserId = () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) return false;

  const payload = JSON.parse(atob(accessToken.split('.')[1]));
  return payload.sub;
};

export const auth = {
  login,
  register,
  refreshAccessToken,
  isTokenValid,
  getCurrentUserId,
  logout
};
