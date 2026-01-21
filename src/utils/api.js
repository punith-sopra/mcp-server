// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://emr-product-datahub-server-sap-stage.azurewebsites.net', // Your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;