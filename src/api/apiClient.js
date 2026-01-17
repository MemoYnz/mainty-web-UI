import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fake auth via X-UserId
apiClient.interceptors.request.use((config) => {
  const userId =  localStorage.getItem('userId');
  if (userId) {
    config.headers['X-UserId'] = userId;
  }
  return config;
});


// import axios from 'axios';
// import { API_BASE_URL } from '../config/env';

// export const apiClient = axios.create({
//   baseURL: API_BASE_URL
// });

// apiClient.interceptors.request.use((config) => {
//   const userId = localStorage.getItem('userId');
//   if (userId) {
//     config.headers['X-UserId'] = userId;
//   }
//   return config;
// });
