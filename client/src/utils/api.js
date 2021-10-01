import axios from 'axios';

const api = axios.create({
  baseURL: `http://` + (location.hostname === 'localhost' ? location.hostname + ':5000' : location.hostname) + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
