import React, { Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import {
  clearSessionData,
  getSessionUser,
  isAdminUser,
  isRuninKioskUser,
} from '../../core/auth/session';
import { supabase } from '../../core/api/supabaseClient';
import LeiaWidget from '../../features/ai-assistant/components/LeiaWidget';
import NewsPopup from '../../features/news/components/NewsPopup';

const LoginPage = React.lazy(() => import('../../features/auth/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const RegistrarFalhaPage = React.lazy(() => import('../../features/failures/pages/RegistrarFalhaPage'));
const VisualizarFalhasPage = React.lazy(() => import('../../features/failures/pages/VisualizarFalhasPage'));
const AlterarSenhaPage = React.lazy(() => import('../../features/auth/pages/AlterarSenhaPage'));
const AdminPage = React.lazy(() => import('../../features/admin/pages/AdminPage'));
const AdminCockpitPage = React.lazy(() => import('../../features/admin/pages/AdminCockpitPage'));
const HomePage = React.lazy(() => import('../../features/home/pages/HomePage'));
const FaleConoscoPage = React.lazy(() => import('../../features/home/pages/FaleConoscoPage'));
const MonitorTvPage = React.lazy(() => import('../../features/monitoring/pages/MonitorTvPage'));
const AIAssistantPage = React.lazy(() => import('../../features/ai-assistant/pages/AIAssistantPage'));
const RuninKioskPage = React.lazy(() => import('../../features/failures/pages/RuninKioskPage'));
const AbrirChamadoEntry = React.lazy(() => import('../../features/failures/pages/FabricaStatusPage'));

function RouterFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
    </div>
  );
}

function useVerifiedSession(localUser) {
  const [state, setState] = useState({
    checking: Boolean(localUser),
    hasSession: Boolean(localUser),
  });

  useEffect(() => {
    let cancelled = false;

    if (!localUser) {
      setState({ checking: false, hasSession: false });
      return () => {
        cancelled = true;
      };
    }

    async function verifySession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error || !session) {
        clearSessionData();
        setState({ checking: false, hasSession: false });
        return;
      }

      setState({ checking: false, hasSession: true });
    }

    setState({ checking: true, hasSession: Boolean(localUser) });
    verifySession();

    return () => {
      cancelled = true;
    };
  }, [localUser?.id, localUser?.role, localUser?.username, localUser?.setor_fixo]);

  return state;
}

const NonKioskLayout = () => {
  const user = getSessionUser();
  const { checking, hasSession } = useVerifiedSession(user);
  if (checking) return <RouterFallback />;
  if (!hasSession) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/" replace />;
  if (isRuninKioskUser(user)) return <Navigate to="/abrir-chamado" replace />;
  return (
    <>
      <Outlet />
      <LeiaWidget />
      <NewsPopup userId={user?.id} />
    </>
  );
};

const AdminLayout = () => {
  const user = getSessionUser();
  const { checking, hasSession } = useVerifiedSession(user);
  if (checking) return <RouterFallback />;
  if (!hasSession) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/" replace />;
  if (isRuninKioskUser(user)) return <Navigate to="/abrir-chamado" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Outlet />
      <LeiaWidget />
      <NewsPopup userId={user?.id} />
    </>
  );
};

const AuthenticatedLayout = () => {
  const user = getSessionUser();
  const { checking, hasSession } = useVerifiedSession(user);
  if (checking) return <RouterFallback />;
  if (!hasSession) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/" replace />;
  return (
    <>
      <Outlet />
      {!isRuninKioskUser(user) && <LeiaWidget />}
      {!isRuninKioskUser(user) && <NewsPopup userId={user?.id} />}
    </>
  );
};

const PublicOnlyLayout = () => {
  const user = getSessionUser();
  const [checking, setChecking] = useState(Boolean(user));
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!user) {
        setChecking(false);
        setHasSession(false);
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error || !session) {
        clearSessionData();
        setHasSession(false);
        setChecking(false);
        return;
      }

      setHasSession(true);
      setChecking(false);
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, user?.username, user?.setor_fixo]);

  if (checking) return <RouterFallback />;
  if (hasSession && user) {
    return <Navigate to={isRuninKioskUser(user) ? '/abrir-chamado' : '/dashboard'} replace />;
  }
  return <Outlet />;
};

function AbrirChamadoRoute() {
  const user = getSessionUser();
  if (isRuninKioskUser(user)) return <RuninKioskPage />;
  return <AbrirChamadoEntry />;
}

function AppRouter() {
  return (
    <Suspense
      fallback={<RouterFallback />}
    >
      <Routes>
        <Route element={<PublicOnlyLayout />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route element={<NonKioskLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/fale-conosco" element={<FaleConoscoPage />} />
          <Route path="/registrar" element={<RegistrarFalhaPage />} />
          <Route path="/visualizar" element={<VisualizarFalhasPage />} />
          <Route path="/monitor-tv" element={<MonitorTvPage />} />
          <Route path="/assistente" element={<AIAssistantPage />} />
        </Route>

        <Route element={<AuthenticatedLayout />}>
          <Route path="/abrir-chamado" element={<AbrirChamadoRoute />} />
          <Route path="/chamado" element={<Navigate to="/abrir-chamado" replace />} />
          <Route path="/abrir-kiosk" element={<Navigate to="/abrir-chamado" replace />} />
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
