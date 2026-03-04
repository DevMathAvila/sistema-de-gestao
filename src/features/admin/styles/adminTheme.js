export function getAdminThemeClasses(theme) {
  return {
    bg: theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200 shadow-xl',
    card: theme === 'dark' ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50',
    input: theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    sub: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
  };
}

export function getAdminScrollbarCss(theme) {
  return `
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'};
      border-radius: 20px;
      border: 2px solid ${theme === 'dark' ? '#050505' : '#f8fafc'};
    }
  `;
}
