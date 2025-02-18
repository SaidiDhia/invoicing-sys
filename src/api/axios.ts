import _axios from 'axios';
import { auth } from './auth';

const BASE_URL =
  typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.BASE_URL;

const axios = _axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

axios.interceptors.request.use(
  function (config) {
    const locale = typeof window !== 'undefined' ? window.localStorage.getItem('locale') : 'fr';
    config.headers['x-custom-lang'] = locale;

    // Add the current access token to the headers
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

// Flag to prevent multiple refresh requests at once
let isRefreshing = false;
let failedQueue: any[] = [];

// Helper function to process the failed requests queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });

  failedQueue = [];
};

// Add a response interceptor to handle expired tokens
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Check if the error is due to token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the failed requests while refreshing the token
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        const newAccessToken = await auth.refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axios(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        auth.logout(); // Clear tokens and log out the user
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
