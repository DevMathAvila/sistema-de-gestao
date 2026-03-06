import React from 'react';

export default function TraveSelector({
  formData,
  setTrave,
  traveTemErro,
  theme,
  colors,
}) {
  return (
    <div className={`${colors.card} backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <label className={`flex items-center gap-3 text-[11px] font-black ${colors.subtext} uppercase tracking-widest`}>
          Identificacao da Trave
        </label>
        {formData.trave && (
          <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-lg animate-in fade-in zoom-in">
            TRAVE {formData.trave} SELECIONADA
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {[...Array(23)].map((_, i) => {
          const num = i + 1;
          const erro = traveTemErro(num);
          const isSelected = String(formData.trave) === String(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => setTrave(num)}
              className={`h-16 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden font-black text-xl ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                  : erro
                    ? (theme === 'dark' ? 'bg-red-950/30 border-red-600/50 text-red-500' : 'bg-red-50 border-red-200 text-red-600')
                    : `${colors.buttonInativo} ${colors.hover}`
              }`}
            >
              {num}
              {erro && !isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
