export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function mobileHeaderClass(theme) {
  return cx(
    'md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl',
    theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200',
  );
}

export function mobileIconButtonClass(theme) {
  return cx(
    'p-2.5 rounded-xl border transition-all',
    theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
  );
}

export function mobileCloseButtonClass(theme) {
  return cx('p-2 rounded-lg', theme === 'dark' ? 'bg-white/5' : 'bg-slate-100');
}

export function mobileDrawerClass(theme, darkBg = 'bg-[#060606]/95') {
  return cx(
    'fixed inset-0 z-[60] border-r shadow-2xl',
    theme === 'dark' ? `${darkBg} border-white/10 backdrop-blur-2xl` : 'bg-white/95 border-slate-200 backdrop-blur-2xl',
  );
}

export function themeToggleClass(theme, compact = false) {
  const size = compact ? 'w-full p-3' : 'w-full min-h-12 p-3';
  return cx(
    size,
    'rounded-xl border flex items-center justify-between',
    theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50',
  );
}

export function profilePanelClass(theme) {
  return cx('flex items-center gap-4 p-4 rounded-2xl', theme === 'dark' ? 'bg-white/5' : 'bg-slate-50');
}

export function dateTileClass(theme) {
  return cx(
    'border rounded-2xl px-4 py-3 text-left transition-all hover:border-red-500/40 active:scale-[0.99]',
    theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900',
  );
}

export function datePopoverClass(theme) {
  return cx(
    'border shadow-2xl',
    theme === 'dark' ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200',
  );
}

export function bottomNavShellClass(isAdmin) {
  return cx(
    'grid gap-1.5 rounded-[1.6rem] border border-red-500/25 bg-gradient-to-b from-white/15 via-white/5 to-white/0',
    'shadow-[0_14px_40px_rgba(220,38,38,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl px-2.5 py-2',
    isAdmin ? 'grid-cols-3' : 'grid-cols-2',
  );
}

export function bottomNavButtonClass(active) {
  return cx(
    'h-14 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95',
    active
      ? 'border-red-300/70 bg-gradient-to-b from-red-500/95 to-red-700/85 text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)]'
      : 'border-white/10 bg-white/[0.03] text-slate-200 hover:text-white hover:border-red-400/35 hover:bg-red-500/10',
  );
}
