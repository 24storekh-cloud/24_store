import React, { useState } from 'react';
import Login from './components/Login'; // Import component ដែលបងទើបផ្ញើមក
import AdminDashboard from './AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  // ឆែកមើល Token ក្នុង LocalStorage ពេល Refresh page
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <>
      {/* បន្ថែម Toaster នៅទីនេះដើម្បីឱ្យ toast.success បង្ហាញចេញមក */}
      <Toaster position="top-right" reverseOrder={false} />
      
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <AdminDashboard token={token} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;