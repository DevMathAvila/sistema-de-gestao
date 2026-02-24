import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState(localStorage.getItem('lenovo_remember_user') || '');
  const [password, setPassword] = useState(localStorage.getItem('lenovo_remember_pass') || '');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('lenovo_remember_user'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanUsername = username.toLowerCase().trim();

      // 1. Busca o usuário na tabela 'usuarios'
      const { data: user, error: supabaseError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', cleanUsername)
        .eq('senha', password) 
        .maybeSingle();

      if (supabaseError) throw supabaseError;

      if (!user) {
        setError("Usuário ou senha incorretos.");
        setLoading(false);
        return;
      }

      // --- INCREMENTO CRÍTICO PARA RESOLVER O SEU ERRO ---
      
      // 2. Limpamos o localStorage ANTES de gravar o novo para evitar conflitos de cache
      localStorage.removeItem('lenovo_user');

      // 3. Criamos o objeto de sessão garantindo que o ID seja o que o banco espera
      // Se user.id for o UUID longo, ele manterá o valor, mas não travará o sistema
      const sessaoFormatada = {
        ...user,
        id: user.id // Mantemos o ID original vindo da tabela 'usuarios'
      };

      // 4. Grava a nova sessão limpa
      localStorage.setItem('lenovo_user', JSON.stringify(sessaoFormatada));
      
      if (rememberMe) {
        localStorage.setItem('lenovo_remember_user', cleanUsername);
        localStorage.setItem('lenovo_remember_pass', password);
      } else {
        localStorage.removeItem('lenovo_remember_user');
        localStorage.removeItem('lenovo_remember_pass');
      }
      
      navigate('/dashboard');

    } catch (err) {
      setError("Falha na conexão: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_#001A33_0%,_#050505_100%)]">
      <div className="p-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-black tracking-tighter inline-block relative italic">
            LENOVO
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#E2231A]"></span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase font-bold">Asset Tracking System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="text-gray-300 text-[10px] uppercase font-black ml-1 tracking-widest">Usuário</label>
            <input 
              required
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E2231A] transition-all placeholder:text-gray-600"
              placeholder="Seu login"
            />
          </div>
          
          <div>
            <label className="text-gray-300 text-[10px] uppercase font-black ml-1 tracking-widest">Senha</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E2231A] transition-all placeholder:text-gray-600 font-mono"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input 
              type="checkbox" 
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#E2231A] cursor-pointer bg-white/5 border-white/10"
            />
            <label htmlFor="remember" className="text-gray-400 text-[10px] font-black cursor-pointer hover:text-gray-200 transition-colors uppercase tracking-widest">
              Lembrar credenciais
            </label>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#E2231A] hover:bg-[#c11e16] disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Autenticando...
              </>
            ) : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;