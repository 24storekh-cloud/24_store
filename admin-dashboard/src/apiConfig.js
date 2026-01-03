// admin-dashboard/src/apiConfig.js និង client/src/apiConfig.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://two4-store.onrender.com'  // <--- នេះជា Link ពិតរបស់បង
  : 'http://localhost:10000';

export default API_URL;