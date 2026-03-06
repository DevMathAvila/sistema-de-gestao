import React from 'react';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { useRuninKioskPage } from '../hooks/useRuninKioskPage';

export default function RuninKioskPage() {
  const vm = useRuninKioskPage();

  return (
    <div className={`min-h-screen ${vm.styles.bg} ${vm.styles.text} p-4 md:p-8 font-sans transition-colors duration-500`}>
      {vm.isSuccess && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center">
          <div className="rounded-3xl bg-emerald-500 text-black p-8 text-center shadow-2xl">
            <CheckCircle2 size={52} className="mx-auto mb-3" />
            <p className="text-2xl font-black uppercase tracking-wider">Chamado Registrado</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className={`rounded-[2rem] border p-5 sm:p-7 flex items-start justify-between ${vm.styles.card}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Modo Kiosk</p>
            <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mt-2">
              Abrir Chamado <span className="text-red-600">{vm.setor || 'Sem Setor'}</span>
            </h1>
            <p className={`text-xs mt-2 ${vm.styles.subtext}`}>
              Usuario: {vm.user.username} | Tela restrita ao setor configurado.
            </p>
          </div>
          <button
            type="button"
            onClick={vm.toggleTheme}
            className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${vm.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-white'}`}
            aria-label="Alternar tema"
          >
            {vm.theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-red-600" />}
          </button>
        </header>

        {!vm.setor ? (
          <section className={`${vm.styles.card} border rounded-[2rem] p-8 mt-6`}>
            <p className="text-red-600 font-black uppercase">Setor fixo nao configurado para este usuario.</p>
            <p className={`text-sm mt-2 ${vm.styles.subtext}`}>Solicite ao admin definir o `setor_fixo` deste login.</p>
          </section>
        ) : (
          <form onSubmit={vm.handleSubmit} className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className={`${vm.styles.card} border rounded-[2rem] p-6 xl:col-span-8`}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Selecionar trave</p>
                {vm.syncing && <p className={`text-[10px] font-black uppercase ${vm.styles.subtext}`}>Sincronizando...</p>}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
                {vm.traves.map((num) => {
                  const isSelected = String(vm.formData.trave) === String(num);
                  const hasError = vm.traveTemErro(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => vm.setFormData((prev) => ({ ...prev, trave: num, pontos: [] }))}
                      className={`h-14 rounded-xl border-2 font-black transition-all ${
                        isSelected
                          ? 'bg-red-600 border-red-500 text-white'
                          : hasError
                            ? vm.theme === 'dark'
                              ? 'bg-red-950/25 border-red-600/60 text-red-500'
                              : 'bg-red-50 border-red-200 text-red-600'
                            : vm.theme === 'dark'
                              ? 'bg-white/5 border-white/10'
                              : 'bg-white border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Selecionar pontos</p>
                  <button
                    type="button"
                    onClick={vm.selecionarTodosPontos}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-red-600"
                  >
                    {vm.formData.pontos.length === vm.pontos.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
                  {vm.pontos.map((p) => {
                    const selected = vm.formData.pontos.includes(p);
                    const info = vm.getInfoPonto(p);
                    return (
                      <div key={p} className="relative group">
                        <button
                          type="button"
                          onClick={() => vm.togglePonto(p)}
                          className={`h-14 w-full rounded-xl border-2 font-black transition-all ${
                            selected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : info
                                ? vm.theme === 'dark'
                                  ? 'bg-red-950/25 border-red-600/60 text-red-500'
                                  : 'bg-red-50 border-red-200 text-red-600'
                                : vm.theme === 'dark'
                                  ? 'bg-white/5 border-white/10'
                                  : 'bg-white border-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                        {info && (
                          <div className={`pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl border p-2 opacity-0 group-hover:opacity-100 transition-all ${
                            vm.theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white border-slate-200 shadow-xl'
                          }`}>
                            <p className={`text-[10px] font-black uppercase leading-tight ${vm.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {info}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className={`${vm.styles.card} border rounded-[2rem] p-6 xl:col-span-4`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-4">Tipos de falha</p>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {vm.falhasComuns.map((falha) => {
                  const selected = vm.formData.falhas.includes(falha);
                  return (
                    <button
                      key={falha}
                      type="button"
                      onClick={() => vm.toggleFalha(falha)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between text-left font-black uppercase text-[11px] tracking-wide ${
                        selected
                          ? 'bg-gradient-to-r from-red-600 to-rose-500 border-red-500 text-white'
                          : vm.theme === 'dark'
                            ? 'bg-white/5 border-white/10 hover:border-red-500/40'
                            : 'bg-white border-slate-200 hover:border-red-300'
                      }`}
                    >
                      <span className="pr-3">{falha}</span>
                      <Zap size={14} className={selected ? 'text-white' : 'text-red-600'} />
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={vm.loading || !vm.formData.trave || vm.formData.pontos.length === 0 || vm.formData.falhas.length === 0}
                className="mt-5 h-16 w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] disabled:opacity-40"
              >
                {vm.loading ? 'Registrando...' : 'Registrar chamado'}
              </button>
            </section>
          </form>
        )}
      </div>
    </div>
  );
}
