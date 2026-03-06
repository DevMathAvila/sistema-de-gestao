import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function FalhasSelector({
  falhas,
  formData,
  toggleFalha,
  theme,
  colors,
}) {
  return (
    <div className={`${colors.card} p-8 rounded-[3rem] shadow-2xl flex-1`}>
      <label className={`text-[11px] font-black ${colors.subtext} uppercase tracking-widest mb-10 block`}>
        Tipos de Ocorrencia
      </label>

      <div className="space-y-3">
        {falhas.map((falha) => {
          const isSelected = formData.falhas.includes(falha);
          return (
            <button
              key={falha}
              type="button"
              onClick={() => toggleFalha(falha)}
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between font-black uppercase tracking-tighter text-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400 text-white shadow-xl translate-x-2'
                  : `${colors.buttonInativo} hover:bg-slate-200/50`
              }`}
            >
              {falha}
              {isSelected ? <CheckCircle2 size={20} /> : <div className={`w-6 h-6 rounded-full border-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
