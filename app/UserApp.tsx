
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TransfersPage from './pages/TransfersPage';
import ExchangePage from './pages/ExchangePage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import KycPage from './pages/KycPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSettingsPage from './pages/UserSettingPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

const UserApp: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      
      <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="exchange" element={<ExchangePage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="kyc" element={<KycPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="settings" element={<UserSettingsPage />} />
        {/* Add other user routes here */}
        <Route path="*" element={<Navigate to="dashboard" replace />} /> {/* Fallback for /app/* */}
      </Route>
    </Routes>
  );
};

export default UserApp;
    