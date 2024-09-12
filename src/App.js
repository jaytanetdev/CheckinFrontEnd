import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import หน้าหลัก
import DashboardPage from './pages/DashboardPage'; // Import หน้าหลัก
import LocationPage from './pages/LocationPage'; // Import หน้าเกี่ยวกับ
import AdvertPage from './pages/AdvertPage'; // Import หน้าเกี่ยวกับ
import UserPage from './pages/UserPage'; // Import หน้าเกี่ยวกับ
import LoginPage from './pages/LoginPage'; // Import หน้าเกี่ยวกับ


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Dashboard" element={<DashboardPage />} />
          <Route path="/UserPage" element={<UserPage />} />
          <Route path="/Location" element={<LocationPage />} />
          <Route path="/Advert" element={<AdvertPage />} />
        </Routes>
      </Router>

    </>
  );
}

export default App;
