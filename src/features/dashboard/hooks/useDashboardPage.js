import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSessionData, getSessionUser, isAdminUser } from '../../../core/auth/session';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';

export function useDashboardPage() {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isAdmin = isAdminUser(user);
  const { theme, toggleTheme } = usePersistentTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  const styles = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
  }), [theme]);

  const handleLogout = () => {
    clearSessionData();
    navigate('/', { replace: true });
  };

  const navigateAndCloseMobile = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return {
    user,
    isAdmin,
    theme,
    toggleTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    styles,
    handleLogout,
    navigateAndCloseMobile,
    navigate,
  };
}
