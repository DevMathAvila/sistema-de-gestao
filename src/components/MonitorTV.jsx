import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { AlertTriangle, Octagon } from 'lucide-react';

const MonitorTV = () => {
  const [falhas, setFalhas] = useState([]);
  const [stats, setStats] = useState({ total: 0, criticas: 0 });

  const normalizar = (texto) => String(texto || "").replace(/\s|-|_/g, '').toLowerCase().trim();

  const processarDados = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('registros_falhas').select('*');
      if (error) throw error;

      const listaAbertos = (data || []).filter(f => 
        String(f.status || "").toLowerCase().trim() === 'aberto'
      );
      
      setFalhas(listaAbertos);
      const criticas = listaAbertos.filter(f => {
        const pNorm = normalizar(f.ponto);
        return pNorm.includes('travetoda') || pNorm.includes('1-15');
      }).length;

      setStats({ total: listaAbertos.length, criticas });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    processarDados();
    const interval = setInterval(processarDados, 5000);
    return () => clearInterval(interval);
  }, [processarDados]);

  const montarDados = () => {
    const setores = ["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"];
    return setores.map(nome => {
      const chamados = falhas.filter(f => normalizar(f.setor) === normalizar(nome));
      const resumoFalhas = {};
      chamados.forEach(c => {
        const f = c.falha?.toUpperCase() || "N/D";
        resumoFalhas[f] = (resumoFalhas[f] || 0) + 1;
      });

      return {
        nome,
        qtd: chamados.length,
        detalhes: Object.entries(resumoFalhas).sort((a,b) => b[1] - a[1]).slice(0, 2),
        critico: chamados.some(f => normalizar(f.ponto).includes('travetoda') || normalizar(f.ponto).includes('1-15'))
      };
    }).filter(s => s.qtd > 0);
  };

  const painel = montarDados();

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden p-2 flex flex-col font-sans">
      
      {/* HEADER ULTRA COMPACTO */}
      <div className="h-[8%] flex justify-between items-center px-4 bg-zinc-900 rounded-xl mb-2 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 px-3 py-1 font-black italic">LENOVO</div>
          <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Real-Time NOC</span>
        </div>
        <div className="flex gap-8 text-sm font-black italic">
          <span className="text-red-500 uppercase">Alertas: {stats.total}</span>
          <span className="text-purple-500 uppercase">Paradas: {stats.criticas}</span>
        </div>
      </div>

      {/* GRID DINÂMICO SEM SCROLL */}
      <div className="flex-1 overflow-hidden">
        {painel.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-800 font-black text-4xl uppercase italic">
            Linha Nominal
          </div>
        ) : (
          <div className={`h-full grid gap-2 ${
            painel.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
          } auto-rows-fr`}>
            {painel.map((s) => (
              <div key={s.nome} className={`flex flex-col rounded-xl border-2 overflow-hidden ${
                s.critico ? 'border-red-600 bg-red-950/20 animate-pulse' : 'border-zinc-800 bg-zinc-900/50'
              }`}>
                {/* SETOR E QUANTIDADE */}
                <div className={`px-4 py-2 flex justify-between items-center ${s.critico ? 'bg-red-600' : 'bg-zinc-800'}`}>
                  <span className="text-lg font-black uppercase italic leading-none">{s.nome}</span>
                  <div className="flex items-center gap-2">
                    {s.critico && <AlertTriangle size={16} />}
                    <span className="text-2xl font-black leading-none">{s.qtd}</span>
                  </div>
                </div>

                {/* FALHAS ESPECÍFICAS */}
                <div className="p-3 flex-1 flex flex-col justify-center gap-2">
                  {s.detalhes.map(([nome, qtd], i) => (
                    <div key={i} className="flex justify-between items-center border-b border-zinc-800 pb-1">
                      <span className="text-[10px] font-bold uppercase truncate text-zinc-300 w-4/5">{nome}</span>
                      <span className="text-xs font-black text-white">{qtd}x</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorTV;