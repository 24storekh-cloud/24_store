// src/apiConfig.js
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost 
  ? 'http://localhost:5000' 
  : 'https://two4-store.onrender.com'; // ប្តូរ Link នេះទៅជា Link Backend ពិតរបស់បង

export default API_URL;