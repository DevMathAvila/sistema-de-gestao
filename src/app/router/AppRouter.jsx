import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { getSessionUser, isAdminUser } from '../../core/auth/session';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import FabricaStatusPage from '../../features/failures/pages/FabricaStatusPage';
import RegistrarFalhaPage from '../../features/failures/pages/RegistrarFalhaPage';
import VisualizarFalhasPage from '../../features/failures/pages/VisualizarFalhasPage';
import AlterarSenhaPage from '../../features/auth/pages/AlterarSenhaPage';
import AdminPage from '../../features/admin/pages/AdminPage';
import AdminCockpitPage from '../../features/admin/pages/AdminCockpitPage';
import HomePage from '../../features/home/pages/HomePage';
import FaleConoscoPage from '../../features/home/pages/FaleConoscoPage';
import MonitorTvPage from '../../features/monitoring/pages/MonitorTvPage';

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

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/fale-conosco" element={<FaleConoscoPage />} />
        <Route path="/abrir-chamado" element={<FabricaStatusPage />} />
        <Route path="/registrar" element={<RegistrarFalhaPage />} />
        <Route path="/visualizar" element={<VisualizarFalhasPage />} />
        <Route path="/monitor-tv" element={<MonitorTvPage />} />
        <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/cockpit" element={<AdminCockpitPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
