export function getFailureTheme(theme) {
  return {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    card: theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    input: theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    mutedCard: theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200',
  };
}
