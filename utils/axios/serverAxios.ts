import axios from 'axios';

export const serverAxios = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/api`,
});
