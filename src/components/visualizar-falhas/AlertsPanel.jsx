import React from 'react';
import { AlertTriangle, ArrowRight, Bell, BellRing, Octagon } from 'lucide-react';

export default function AlertsPanel({
  theme,
  colors,
  alertasCriticos,
  showNotifications,
  setShowNotifications,
  irParaTraveRecorrente,
  totalFalhas,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-4 rounded-2xl transition-all relative border shadow-md ${
            alertasCriticos.length > 0
              ? (alertasCriticos.some((a) => a.isTraveToda)
                  ? 'bg-purple-600 border-purple-400 text-white animate-bounce shadow-purple-500/20'
                  : 'bg-red-600 border-red-400 text-white shadow-red-500/20')
              : `${colors.card} ${colors.subtext}`
          }`}
        >
          {alertasCriticos.length > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          {alertasCriticos.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-gray-200">
              {alertasCriticos.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className={`absolute right-0 mt-4 w-80 border ${theme === 'dark' ? 'bg-[#0A0A0A] border-white/10' : 'bg-white/95 border-slate-200'} rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl z-[120] overflow-hidden animate-in fade-in zoom-in-95`}>
            <div className={`p-5 border-b ${theme === 'dark' ? 'border-white/5 bg-gradient-to-r from-black to-zinc-900' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'} flex justify-between items-center`}>
              <div>
                <span className={`text-[10px] font-black tracking-widest uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Central de Alertas</span>
                <p className="text-[7px] text-red-500 font-bold uppercase tracking-[0.2em]">Prioridade Critica</p>
              </div>
              <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-red-500 transition-colors">x</button>
            </div>
            <div className={`max-h-[400px] overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-black/40' : 'bg-slate-50/50'}`}>
              {alertasCriticos.length === 0 ? (
                <div className="p-12 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">Nenhuma anormalidade</div>
              ) : (
                <div className="flex flex-col">
                  {alertasCriticos.map((alerta, idx) => {
                    const isFirstParada = alerta.isTraveToda && idx === 0;
                    const isFirstRecorrente = !alerta.isTraveToda && (idx === 0 || alertasCriticos[idx - 1].isTraveToda);

                    return (
                      <React.Fragment key={`${alerta.setor}-${alerta.trave}-${idx}`}>
                        {isFirstParada && (
                          <div className="px-4 py-2 bg-purple-600/10 border-y border-purple-500/20 flex items-center gap-2">
                            <Octagon size={10} className="text-purple-500 animate-pulse" />
                            <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest">Traves Bloqueadas</span>
                          </div>
                        )}
                        {isFirstRecorrente && (
                          <div className="px-4 py-2 bg-red-600/10 border-y border-red-500/20 flex items-center gap-2">
                            <AlertTriangle size={10} className="text-red-500" />
                            <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Alta Recorrencia (+5)</span>
                          </div>
                        )}
                        <div
                          onClick={() => irParaTraveRecorrente(alerta.setor, alerta.trave)}
                          className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 hover:bg-white/[0.05]' : 'border-slate-100 hover:bg-red-50/50'} cursor-pointer group transition-all relative overflow-hidden ${alerta.isTraveToda ? 'bg-purple-600/[0.03]' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-[11px] font-black uppercase transition-colors ${alerta.isTraveToda ? 'text-purple-600' : `${theme === 'dark' ? 'text-white group-hover:text-red-500' : 'text-slate-800 group-hover:text-red-600'}`}`}>
                              {alerta.setor} <span className="opacity-30 ml-1">•</span> T{alerta.trave}
                            </p>
                            {alerta.isTraveToda ? (
                              <span className="bg-purple-600 text-[7px] px-2 py-0.5 rounded-full font-black text-white shadow-lg animate-bounce">STOP</span>
                            ) : (
                              <span className="bg-red-600 text-[7px] px-2 py-0.5 rounded-full font-black text-white">+{alerta.count} FALHAS</span>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 flex items-center gap-1">
                            {alerta.isTraveToda ? 'Parada Total de Linha' : 'Multiplos Pontos com Defeito'}
                            <ArrowRight size={8} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={`p-3 text-center ${theme === 'dark' ? 'bg-black' : 'bg-slate-50'}`}>
              <p className="text-[6px] font-black text-gray-400 uppercase tracking-widest">Sistema de Alerta Lenovo Live</p>
            </div>
          </div>
        )}
      </div>

      <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-red-600/5' : 'bg-red-50'} rounded-2xl border ${theme === 'dark' ? 'border-red-600/20' : 'border-red-100'} flex items-center gap-3`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        <span className="text-[10px] font-black text-red-600 uppercase italic">{totalFalhas} Registros Ativos</span>
      </div>
    </div>
  );
}
