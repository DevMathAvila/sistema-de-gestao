import { useState } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    // Busca o usuário pelo nome na tabela 'usuarios'
    const { data, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .single();

    if (dbError || !data) {
      setError("Usuário não encontrado.");
      setLoading(false);
      return null;
    }

    // Validação simples (Em produção, use criptografia/hash)
    if (data.senha === password) {
      // Salva a sessão no navegador (role e nome)
      localStorage.setItem('lenovo_user', JSON.stringify(data));
      setLoading(false);
      return data;
    } else {
      setError("Senha incorreta.");
      setLoading(false);
      return null;
    }
  };

  return { login, loading, error };
};