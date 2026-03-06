import React from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { mobileCloseButtonClass, mobileDrawerClass, themeToggleClass } from '../../utils/uiClasses';

function MenuButton({ item, subduedClass }) {
  const base = 'w-full min-h-12 flex items-center gap-3 p-4 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left';
  const cls = item.active
    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
    : `${subduedClass} hover:text-red-600`;

  return (
    <button type="button" onClick={item.onClick} className={`${base} ${cls}`}>
      <item.icon size={18} className={item.active ? 'text-white' : 'group-hover:text-red-600 transition-all'} />
      <span>
        <span className="block">{item.label}</span>
        {item.helper ? <span className="block text-[9px] tracking-wide normal-case opacity-70">{item.helper}</span> : null}
      </span>
    </button>
  );
}

export default function AppMobileMenu({
  open,
  theme,
  onClose,
  title,
  navItems,
  onToggleTheme,
  onLogout,
  side = 'right',
  darkBg = 'bg-[#060606]/95',
}) {
  if (!open) return null;

  const asidePosition = side === 'left' ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Fechar menu" />
      <aside className={`absolute top-0 h-full w-[88%] max-w-sm p-6 flex flex-col shadow-2xl ${asidePosition} ${mobileDrawerClass(theme, darkBg)}`}>
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">{title}</p>
          <button type="button" onClick={onClose} className={mobileCloseButtonClass(theme)}>
            <X size={16} />
          </button>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => (
            <MenuButton key={item.id} item={item} subduedClass="text-slate-400" />
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
          <button onClick={onToggleTheme} className={themeToggleClass(theme)}>
            <span className="text-[11px] font-black uppercase">Tema</span>
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <button onClick={onLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest transition-all">
            Encerrar Sessao
          </button>
        </div>
      </aside>
    </div>
  );
}
