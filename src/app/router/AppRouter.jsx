import React, { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { getSessionUser, isAdminUser } from '../../core/auth/session';

const LoginPage = React.lazy(() => import('../../features/auth/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const FabricaStatusPage = React.lazy(() => import('../../features/failures/pages/FabricaStatusPage'));
const RegistrarFalhaPage = React.lazy(() => import('../../features/failures/pages/RegistrarFalhaPage'));
const VisualizarFalhasPage = React.lazy(() => import('../../features/failures/pages/VisualizarFalhasPage'));
const AlterarSenhaPage = React.lazy(() => import('../../features/auth/pages/AlterarSenhaPage'));
const AdminPage = React.lazy(() => import('../../features/admin/pages/AdminPage'));
const AdminCockpitPage = React.lazy(() => import('../../features/admin/pages/AdminCockpitPage'));
const HomePage = React.lazy(() => import('../../features/home/pages/HomePage'));
const FaleConoscoPage = React.lazy(() => import('../../features/home/pages/FaleConoscoPage'));
const MonitorTvPage = React.lazy(() => import('../../features/monitoring/pages/MonitorTvPage'));

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
    <Suspense
      fallback={(
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        </div>
      )}
    >
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
    </Suspense>
  );
}

export default AppRouter;
