import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DashboardHistoricalPoints({ points, theme, s }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const closeDetails = () => setSelectedPoint(null);

  return (
    <>
      <div className={`${s.card} p-6 rounded-[2.5rem]`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-black uppercase italic text-red-600">Pontos com Mais Historico de Registros</h3>
          <span className={`text-[10px] font-black uppercase tracking-widest ${s.sub}`}>
            Clique no registro para abrir detalhes
          </span>
        </div>

        {points.length === 0 ? (
          <p className={`${s.sub} text-sm`}>Sem historico consolidado no periodo.</p>
        ) : (
          <div className="space-y-3">
            {points.map((item) => {
              const key = `${item.setor}-${item.trave}-${item.ponto}`;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPoint(item)}
                  className="w-full text-left rounded-2xl border border-red-600/15 p-4 transition-all hover:border-red-600/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="font-black text-sm">
                      {item.setor} - Trave {item.trave} - Ponto {item.ponto}
                    </p>
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-600">
                      {item.totalEventos} registros
                    </p>
                  </div>
                  <p className={`text-[11px] mt-2 ${s.sub}`}>
                    Ultimo evento: {item.eventos?.[0]?.tipo || '-'} ({item.eventos?.[0]?.dataLabel || '-'})
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPoint && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={closeDetails}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fechar detalhes"
          />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto w-full max-w-2xl">
            <div className={`rounded-3xl border shadow-2xl ${theme === 'dark' ? 'bg-[#090909] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4 p-5 border-b border-red-600/15">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Historico detalhado</p>
                  <h4 className="font-black text-sm">
                    {selectedPoint.setor} - Trave {selectedPoint.trave} - Ponto {selectedPoint.ponto}
                  </h4>
                  <p className={`text-[11px] mt-1 ${s.sub}`}>{selectedPoint.totalEventos} registros encontrados</p>
                </div>
                <button
                  type="button"
                  onClick={closeDetails}
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 max-h-[60vh] overflow-y-auto overscroll-contain">
                <div className="space-y-2.5">
                  {selectedPoint.eventos.map((evento, idx) => (
                    <div key={`${selectedPoint.setor}-${selectedPoint.trave}-${selectedPoint.ponto}-${idx}`} className="rounded-xl border border-red-600/15 p-3">
                      <p className="text-[11px] font-black">{evento.tipo}</p>
                      <p className="text-[10px] opacity-70 mt-1">{evento.dataLabel}</p>
                      <p className="text-[10px] opacity-70">Tecnico: {evento.tecnico}</p>
                      {evento.solucao && evento.solucao !== '-' ? <p className="text-[10px] opacity-70">Acao: {evento.solucao}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
