import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import SetPassword from '@/pages/SetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/set-password" element={<SetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
