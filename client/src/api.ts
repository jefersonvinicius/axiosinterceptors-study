import axios from 'axios';
import { state } from './state';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.response.use(
  (response) => {
    console.log('Success');
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Não autorizado!');
      const {
        data: { token },
      } = await api.post('/renew', { token: String(error.config.headers!['Authorization']).split(' ')[1] });

      const config = error.config;
      if (config.headers) config.headers['Authorization'] = `Bearer ${token}`;

      state.update((s) => {
        if (s.user) s.user.token = token;
      });

      const response = await axios(config);
      return response;
    }

    return Promise.reject(error);
  }
);
