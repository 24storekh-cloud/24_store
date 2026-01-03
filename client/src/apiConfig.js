// client/src/apiConfig.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://two4-store.onrender.com' 
  : 'http://localhost:5000';

export default API_URL;