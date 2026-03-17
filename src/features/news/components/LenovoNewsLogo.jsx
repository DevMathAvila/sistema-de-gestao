import React from 'react';

export default function LenovoNewsLogo({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E2231A] via-red-600 to-orange-500 text-lg font-black text-white shadow-[0_10px_30px_rgba(226,35,26,0.35)]">
          L
        </div>
        <div>
          <p className="text-lg font-black italic leading-none tracking-tight">LENOVO</p>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-red-500">News Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-red-500/25 bg-[linear-gradient(135deg,rgba(226,35,26,0.16),rgba(10,10,10,0.98))] px-5 py-5 shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#E2231A] via-red-500 to-orange-400" />
      <div className="relative flex items-center gap-4 pl-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-[#E2231A] via-red-600 to-orange-500 text-3xl font-black text-white shadow-[0_16px_45px_rgba(226,35,26,0.35)]">
          L
        </div>
        <div>
          <p className="text-2xl font-black italic leading-none tracking-tight text-white sm:text-3xl">LENOVO</p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] text-red-300">Historico de Atualizacoes</p>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Um mural vivo das entregas do sistema, organizado para consulta rapida e onboarding tecnico.
          </p>
        </div>
      </div>
    </div>
  );
}
