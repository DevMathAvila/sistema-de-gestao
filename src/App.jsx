import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registrar from './pages/Registrar';
import VisualizarFalhas from './pages/VisualizarFalhas';
import Admin from './pages/Admin';
import MonitorTV from './components/MonitorTV';
import { getSessionUser, isAdminUser } from './lib/session';

const ProtectedLayout = () => {
  const user = getSessionUser();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
};

const AdminLayout = () => {
  const user = getSessionUser();
  if (!user) return <Navigate to="/" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const PublicOnlyLayout = () => {
  const user = getSessionUser();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

function App() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Routes>
        <Route element={<PublicOnlyLayout />}>
          <Route path="/" element={<Login />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/visualizar" element={<VisualizarFalhas />} />
          <Route path="/monitor-tv" element={<MonitorTV />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
