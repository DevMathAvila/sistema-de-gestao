import React from 'react';
import { Mail, Phone, MessageSquareHeart } from 'lucide-react';

export default function FaleConosco() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <div className="mb-6 flex items-center gap-2 text-red-500">
        <MessageSquareHeart size={18} />
        <h1 className="text-xl font-black uppercase tracking-wide">Fale Conosco</h1>
      </div>

      <p className="text-sm text-slate-200">
        Canal para suporte interno e duvidas operacionais. Utilize os contatos abaixo para atendimento rapido.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-100">
            <Mail size={14} className="text-red-500" />
            <strong>Email</strong>
          </div>
          <p className="text-sm text-slate-300">suporte.fabrica@lenovo.local</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-100">
            <Phone size={14} className="text-red-500" />
            <strong>Ramal</strong>
          </div>
          <p className="text-sm text-slate-300">+55 11 4000-1234</p>
        </div>
      </div>
    </div>
  );
}
