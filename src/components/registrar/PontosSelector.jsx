import React from 'react';

export default function PontosSelector({
  listaPontos,
  formData,
  togglePonto,
  selecionarTodosPontos,
  getInfoPonto,
  theme,
  colors,
}) {
  return (
    <div className={`${colors.card} backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl transition-all duration-500 ${!formData.trave ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center mb-8 px-2">
        <label className={`text-[11px] font-black ${colors.subtext} uppercase tracking-widest`}>Slots da Unidade</label>
        <button type="button" onClick={selecionarTodosPontos} className="text-[10px] font-black text-blue-600 uppercase hover:text-red-600 transition-colors">
          {formData.pontos.length === listaPontos.length ? '[ Desmarcar Todos ]' : '[ Selecionar Todos ]'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {listaPontos.map((p) => {
          const selecionado = formData.pontos.includes(p);
          const falhasNoPonto = getInfoPonto(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => togglePonto(p)}
              className={`relative h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center group font-black ${
                selecionado
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : falhasNoPonto
                    ? (theme === 'dark' ? 'bg-red-900/20 border-red-600 text-red-500' : 'bg-red-50 border-red-300 text-red-600')
                    : `${colors.buttonInativo} ${colors.hover}`
              }`}
            >
              {p}
              {falhasNoPonto && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-2xl transition-all pointer-events-none uppercase font-black italic">
                  {falhasNoPonto}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
