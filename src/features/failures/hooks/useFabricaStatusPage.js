import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser, isAdminUser } from '../../../core/auth/session';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { fetchFalhasAbertas } from '../services/failuresService';
import { getFailureTheme } from '../styles/failureTheme';
import { logoutUser } from '../../auth/services/authService';

export function useFabricaStatusPage() {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isAdmin = isAdminUser(user);
  const { theme, toggleTheme } = usePersistentTheme();

  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  const buscarFalhas = useCallback(async () => {
    try {
      const data = await fetchFalhasAbertas();
      const registrosValidos = data.filter((item) => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map((item) => item.setor))]);
    } catch {
      setSetoresComFalha([]);
    }
  }, []);

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, [buscarFalhas]);

  const handleLogout = useCallback(async () => {
    setSetoresComFalha([]);
    await logoutUser();
    navigate('/', { replace: true });
  }, [navigate]);

  const navigateAndCloseMobile = useCallback((path) => {
    setMobileMenuOpen(false);
    navigate(path);
  }, [navigate]);

  const styles = useMemo(() => getFailureTheme(theme), [theme]);

  const sidebarLinks = useMemo(() => {
    const base = [
      { id: 'abrir', label: 'Abrir chamado', path: '/abrir-chamado' },
      { id: 'visualizar', label: 'Visualizar Falhas', path: '/visualizar' },
      { id: 'inicio', label: 'Voltar ao inicio', path: '/dashboard' },
    ];
    if (!isAdmin) return base;
    return [
      ...base.slice(0, 2),
      {
        id: 'admin',
        label: 'Administracao',
        path: '/admin?tab=indicadores',
        helper: 'Dashboard KPI | Gestao de Equipe',
      },
      base[2],
    ];
  }, [isAdmin]);

  return {
    user,
    isAdmin,
    theme,
    toggleTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    setoresComFalha,
    styles,
    sidebarLinks,
    setores: LISTA_SETORES,
    handleLogout,
    navigateAndCloseMobile,
    navigate,
  };
}
