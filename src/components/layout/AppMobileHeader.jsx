import React from 'react';
import { Menu, X } from 'lucide-react';
import { mobileHeaderClass, mobileIconButtonClass } from '../../utils/uiClasses';

export default function AppMobileHeader({ theme, menuOpen, onToggleMenu, title, subtitle, brand = 'L' }) {
  return (
    <header className={mobileHeaderClass(theme)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-600/30">{brand}</div>
          <div>
            <p className="text-sm font-black italic leading-none">{title}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onToggleMenu} className={mobileIconButtonClass(theme)} aria-label="Abrir menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
}
