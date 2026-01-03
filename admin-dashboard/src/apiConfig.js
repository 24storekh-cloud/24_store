// admin-dashboard/src/apiConfig.js  និង client/src/apiConfig.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://24store-api.onrender.com' // <-- ផាស Link របស់បងនៅទីនេះ
  : 'http://localhost:5000';

export default API_URL;