import React from 'react';
import { Trash2, UserPlus } from 'lucide-react';

export default function AdminUsersTab({
  s,
  theme,
  isMaster,
  usuarios,
  novoUser,
  setNovoUser,
  roleOptions,
  salvandoUsuario,
  removendoUsuario,
  usuarioPendenteRemocao,
  userActionFeedback,
  onCreateUser,
  onAskRemoveUser,
  onCancelRemoveUser,
  onConfirmRemoveUser,
}) {
  const feedbackClass = userActionFeedback?.type === 'success'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
    : 'border-red-600/30 bg-red-600/10 text-red-500';

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-10">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">
          Controle de <span className="text-red-600">Acessos</span>
        </h2>
        <p className={s.sub}>Cadastre novos tecnicos ou gerencie permissoes administrativas.</p>
        {userActionFeedback?.message && (
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-wider ${feedbackClass}`}>
            {userActionFeedback.message}
          </div>
        )}
      </header>

      <div className={`${s.card} p-8 rounded-[2.5rem] mb-10`}>
        <form onSubmit={onCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-2 opacity-50">Username</label>
            <input
              type="text"
              placeholder="ex: jsilva"
              className={`${s.input} w-full p-4 rounded-2xl focus:ring-2 ring-red-600/20 outline-none text-sm transition-all`}
              value={novoUser.username}
              onChange={(e) => setNovoUser({ ...novoUser, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-2 opacity-50">Senha de Acesso</label>
            <input
              type="password"
              placeholder="••••"
              className={`${s.input} w-full p-4 rounded-2xl focus:ring-2 ring-red-600/20 outline-none text-sm font-mono transition-all`}
              value={novoUser.senha}
              onChange={(e) => setNovoUser({ ...novoUser, senha: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-2 opacity-50">Nivel</label>
            <select
              className={`${s.input} w-full p-4 rounded-2xl outline-none text-sm`}
              value={novoUser.role}
              onChange={(e) => setNovoUser({ ...novoUser, role: e.target.value })}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={salvandoUsuario}
            className="mt-6 h-[52px] bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 disabled:bg-slate-500 transition-all uppercase text-xs flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> {salvandoUsuario ? 'Criando...' : 'Criar Usuario'}
          </button>
        </form>
      </div>

      <div className={`${s.card} rounded-[2.5rem] overflow-hidden`}>
        <table className="hidden md:table w-full text-left">
          <thead>
            <tr
              className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}
            >
              <th className="p-6 text-red-600">Nivel</th>
              <th className="p-6 text-current">Usuario</th>
              {isMaster && <th className="p-6 text-right">Acao</th>}
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-red-600/[0.02] transition-colors">
                <td className="p-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-6 font-bold">{u.username}</td>
                {isMaster && (
                  <td className="p-6 text-right">
                    <button
                      type="button"
                      onClick={() => onAskRemoveUser(u)}
                      disabled={removendoUsuario}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="md:hidden p-4 space-y-3">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className={`${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  {u.role}
                </span>
                {isMaster && (
                  <button
                    type="button"
                    onClick={() => onAskRemoveUser(u)}
                    disabled={removendoUsuario}
                    className="h-11 w-11 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm font-black">{u.username}</p>
            </div>
          ))}
        </div>
      </div>

      {usuarioPendenteRemocao && (
        <div className="fixed inset-0 z-[340]">
          <button
            type="button"
            onClick={onCancelRemoveUser}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Fechar confirmacao"
          />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto w-full max-w-md">
            <div className={`rounded-3xl border shadow-2xl ${theme === 'dark' ? 'bg-[#090909] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="p-6 border-b border-red-600/15">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Confirmar Exclusao</p>
                <h3 className="text-lg font-black uppercase italic">
                  Remover <span className="text-red-600">{usuarioPendenteRemocao.username}</span>?
                </h3>
                <p className={`mt-2 text-xs ${s.sub}`}>
                  Esta acao remove o acesso do usuario no sistema.
                </p>
              </div>
              <div className="p-5 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelRemoveUser}
                  disabled={removendoUsuario}
                  className={`h-11 px-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmRemoveUser}
                  disabled={removendoUsuario}
                  className="h-11 px-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:bg-slate-500"
                >
                  {removendoUsuario ? 'Removendo...' : 'Sim, remover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
