import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Sun, Moon, User, LogOut } from 'lucide-react';
import { profilePanelClass, themeToggleClass } from '../../utils/uiClasses';

function SidebarButton({ item, collapsed, subduedClass }) {
  const base = 'w-full flex items-center gap-3 p-4 rounded-2xl transition-all group font-black text-[10px] tracking-widest uppercase text-left';
  const cls = item.active
    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20'
    : `${subduedClass} hover:text-red-600 hover:translate-x-1`;

  return (
    <button type="button" onClick={item.onClick} className={`${base} ${cls}`}>
      <item.icon size={18} className={item.active ? 'text-white' : 'group-hover:text-red-600 transition-all'} />
      {!collapsed && (
        <span className="leading-tight">
          <span className="block">{item.label}</span>
          {item.helper ? <span className="block text-[8px] tracking-wide normal-case opacity-60">{item.helper}</span> : null}
        </span>
      )}
    </button>
  );
}

export default function AppSidebar({
  theme,
  collapsed,
  onToggleCollapsed,
  title,
  subtitle,
  brand = 'L',
  navItems,
  onThemeToggle,
  onLogout,
  username,
  subduedClass = 'text-slate-400',
  className = '',
  onBrandClick,
}) {
  return (
    <aside className={`hidden md:flex ${collapsed ? 'w-24' : 'w-64'} border-r p-4 flex-col z-20 backdrop-blur-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={onBrandClick}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/20">{brand}</div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">{title}</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">{subtitle}</span>
            </div>
          )}
        </div>
        <button onClick={onToggleCollapsed} className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <SidebarButton key={item.id} item={item} collapsed={collapsed} subduedClass={subduedClass} />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
        <button onClick={onThemeToggle} className={themeToggleClass(theme, true)}>
          {!collapsed && <span className="text-[10px] font-black uppercase">Tema</span>}
          {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
        </button>

        <div className={profilePanelClass(theme)}>
          <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[8px] font-black uppercase text-slate-400">Usuario:</p>
              <p className="text-sm font-black truncate italic leading-none">{username}</p>
            </div>
          )}
        </div>

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase text-xs">
          <LogOut size={16} /> {!collapsed && 'Encerrar Sessao'}
        </button>
      </div>
    </aside>
  );
}
