import React from 'react';

export default function PasswordStrengthBar({ theme, forcaSenha, subtextClass }) {
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-black uppercase tracking-wider ${subtextClass}`}>Forca da senha</span>
        <span className={`text-[10px] font-black uppercase tracking-wider ${forcaSenha.forte ? 'text-emerald-500' : forcaSenha.nivel === 'Media' ? 'text-amber-500' : 'text-red-500'}`}>{forcaSenha.nivel}</span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
        <div className={`h-full transition-all duration-300 ${forcaSenha.barra}`} style={{ width: `${forcaSenha.progresso}%` }} />
      </div>
      <p className={`mt-2 text-[10px] font-black uppercase tracking-wider ${subtextClass}`}>
        Minimo 8 caracteres, 1 letra maiuscula, 1 numero e 1 caractere especial.
      </p>
    </div>
  );
}
