// client/src/apiConfig.js
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://two4-store.onrender.com' 
                  : 'https://localhost:5000');

export default API_URL;