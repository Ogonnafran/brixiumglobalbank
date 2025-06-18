import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import UserApp from './app/UserApp';
import AdminApp from './admin/AdminApp';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
            <Route path="/app/*" element={<UserApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<Navigate to="/app/login" replace />} /> 
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;