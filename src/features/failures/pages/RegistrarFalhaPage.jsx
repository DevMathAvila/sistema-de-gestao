import React from 'react';
import { ArrowLeft, Check, CheckCircle2, Cpu, Hash, Layout, Loader2, Moon, Save, Sun, Zap } from 'lucide-react';
import AppBottomNav from '@/shared/components/layout/AppBottomNav';
import { useRegistrarFalhaPage } from '../hooks/useRegistrarFalhaPage';

export default function RegistrarFalhaPage() {
  const {
    setor,
    setorEhAvt,
    loading,
    isSuccess,
    formData,
    setFormData,
    isAdmin,
    theme,
    styles,
    toggleTheme,
    traveTemErro,
    getInfoPonto,
    getInoperantePontoInfo,
    togglePonto,
    toggleFalha,
    selecionarTodosPontos,
    handleSubmit,
    navigate,
    traves,
    pontos,
    falhasComuns,
  } = useRegistrarFalhaPage();

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} p-4 pb-24 font-sans relative transition-colors duration-500 overflow-x-hidden md:p-10 md:pb-10`}>
      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Check size={48} className="text-black stroke-[3px]" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Registro Finalizado</h2>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4 md:mb-12 md:items-center">
          <button onClick={() => navigate('/abrir-chamado')} className={`group flex min-h-11 items-center gap-3 ${styles.subtext} hover:text-red-600 transition-all`}>
            <div className={`p-2 rounded-full ${styles.mutedCard} border group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all`}>
              <ArrowLeft size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.24em] sm:text-[10px] sm:tracking-[0.3em]">Voltar ao Inicio</span>
          </button>
          <button onClick={toggleTheme} className={`min-h-11 min-w-11 p-3 rounded-2xl border ${styles.card}`}>
            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-red-600" />}
          </button>
        </div>

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-12 bg-red-600" />
              <span className="text-red-600 text-[11px] font-black uppercase tracking-[0.2em]">Diagnostic Terminal</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none sm:text-5xl md:text-8xl">{setor}</h2>
          </div>
          <div className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-3 sm:w-auto sm:px-6 ${styles.mutedCard}`}>
            <Cpu size={20} className="text-red-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider">Lenovo System</span>
              <span className={`text-[8px] font-bold ${styles.subtext} uppercase`}>Hardware Engine v3.0</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            {!setorEhAvt && (
              <div className={`${styles.card} rounded-[2rem] p-5 sm:p-6 md:rounded-[3rem] md:p-8`}>
                <div className="flex items-center justify-between mb-8 px-2">
                  <label className={`flex items-center gap-3 text-[11px] font-black ${styles.subtext} uppercase tracking-widest`}>
                    <Hash size={18} className="text-red-600" /> Identificacao da Trave
                  </label>
                  {formData.trave && <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-lg">TRAVE {formData.trave} SELECIONADA</span>}
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
                  {traves.map((num) => {
                    const erro = traveTemErro(num);
                    const isSelected = String(formData.trave) === String(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, trave: num, pontos: [] })}
                        className={`min-h-[44px] h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden font-black text-lg sm:h-16 sm:text-xl ${
                          isSelected
                            ? 'bg-red-600 border-red-500 text-white'
                            : erro
                              ? theme === 'dark'
                                ? 'bg-red-950/30 border-red-600/50 text-red-500'
                                : 'bg-red-50 border-red-200 text-red-600'
                              : `${styles.mutedCard} hover:border-slate-300`
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {setorEhAvt && (
              <div className={`${styles.card} rounded-[2rem] border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6`}>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-500">Setor de Trave Unica</p>
                <p className={`mt-2 text-sm ${styles.subtext}`}>Selecione os pontos e as falhas. Este setor utiliza uma trave logica unica.</p>
              </div>
            )}

            <div className={`${styles.card} rounded-[2rem] p-5 sm:p-6 md:rounded-[3rem] md:p-8 ${!formData.trave ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-8 px-2">
                <label className={`flex items-center gap-3 text-[11px] font-black ${styles.subtext} uppercase tracking-widest`}>
                  <Layout size={18} className="text-blue-500" /> Slots da Unidade
                </label>
                <button type="button" onClick={selecionarTodosPontos} className="text-[10px] font-black text-blue-600 uppercase hover:text-red-600">
                  {formData.pontos.length === pontos.length ? '[ Desmarcar Todos ]' : '[ Selecionar Todos ]'}
                </button>
              </div>
              <div className={`grid gap-2 sm:gap-3 ${setorEhAvt ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-10' : 'grid-cols-4 sm:grid-cols-5'}`}>
                {pontos.map((p) => {
                  const selecionado = formData.pontos.includes(p);
                  const falhasNoPonto = getInfoPonto(p);
                  const inoperanteInfo = getInoperantePontoInfo(p);
                  return (
                    <div key={p} className="relative group">
                      <button
                        type="button"
                        onClick={() => togglePonto(p)}
                        className={`min-h-[44px] h-12 w-full rounded-2xl border-2 transition-all duration-300 flex items-center justify-center font-black sm:h-14 ${
                          selecionado
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : inoperanteInfo
                                ? theme === 'dark'
                                  ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                                  : 'bg-amber-50 border-amber-300 text-amber-700'
                              : falhasNoPonto
                                ? theme === 'dark'
                                  ? 'bg-red-900/20 border-red-600 text-red-500'
                                  : 'bg-red-50 border-red-300 text-red-600'
                              : `${styles.mutedCard} hover:border-slate-300`
                        } ${inoperanteInfo && !selecionado ? 'ring-2 ring-amber-400/70 animate-pulse' : ''}`}
                      >
                        {p}
                      </button>
                      {(falhasNoPonto || inoperanteInfo) && (
                        <div className={`pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl border p-2 opacity-0 group-hover:opacity-100 transition-all ${
                          theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white border-slate-200 shadow-xl'
                        }`}>
                          {falhasNoPonto && (
                            <p className={`text-[10px] font-black uppercase leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {falhasNoPonto}
                            </p>
                          )}
                          {inoperanteInfo && (
                            <p className="mt-1 text-[10px] font-black uppercase leading-tight text-amber-500 animate-pulse">
                              {inoperanteInfo.label}
                            </p>
                          )}
                          {inoperanteInfo?.details && (
                            <p className={`mt-1 text-[9px] leading-tight ${theme === 'dark' ? 'text-amber-200' : 'text-amber-700'}`}>
                              {inoperanteInfo.details}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8 flex flex-col">
            <div className={`${styles.card} rounded-[2rem] p-5 sm:p-6 md:rounded-[3rem] md:p-8 flex-1`}>
              <label className={`flex items-center gap-3 text-[11px] font-black ${styles.subtext} uppercase tracking-widest mb-10`}>
                <Zap size={18} className="text-yellow-500" /> Tipos de Ocorrencia
              </label>
              <div className="space-y-3">
                {falhasComuns.map((falha) => {
                  const isSelected = formData.falhas.includes(falha);
                  return (
                    <button
                      key={falha}
                      type="button"
                      onClick={() => toggleFalha(falha)}
                      className={`w-full min-h-[44px] p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between font-black uppercase tracking-tighter text-sm ${
                        isSelected ? 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400 text-white' : `${styles.mutedCard} hover:bg-slate-200/50`
                      }`}
                    >
                      {falha}
                      {isSelected ? <CheckCircle2 size={20} /> : <div className={`w-6 h-6 rounded-full border-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={formData.falhas.length === 0 || !formData.trave || formData.pontos.length === 0 || loading}
              className={`flex w-full min-h-[56px] items-center justify-center gap-4 rounded-[2rem] p-5 text-lg font-black transition-all duration-500 sm:rounded-[2.5rem] sm:p-8 sm:text-2xl ${
                loading ? 'bg-slate-800' : `${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:bg-red-600 hover:text-white disabled:opacity-20`
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={36} /> : <><Save size={32} /><span className="italic uppercase tracking-tighter">Registrar Falha</span></>}
            </button>
          </div>
        </form>
      </div>

      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
}
