import React, { useEffect, useMemo, useRef } from 'react';
import {
  Bot,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  SendHorizontal,
  Shield,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import SupportMenuItem from '../../../components/SupportMenuItem';
import { useAIAssistant } from '../hooks/useAIAssistant';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'visualizar', label: 'Visualizar Falhas', path: '/visualizar', icon: Eye },
  { id: 'assistente', label: 'Assistente IA', path: '/assistente', icon: Bot, active: true },
  { id: 'admin', label: 'Administracao', path: '/admin?tab=indicadores', icon: Shield, adminOnly: true },
];

export default function AIAssistantPage() {
  const vm = useAIAssistant();
  const bottomRef = useRef(null);
  const visibleNav = useMemo(
    () => navItems.filter((item) => !item.adminOnly || vm.isAdmin),
    [vm.isAdmin],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [vm.messages, vm.loading]);

  return (
    <div className={`min-h-screen ${vm.styles.bg} ${vm.styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${vm.theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-black italic leading-none">Assistente IA</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${vm.styles.subtext}`}>Gemini Workspace</p>
            </div>
          </div>
          <button type="button" onClick={() => vm.setMobileMenuOpen((v) => !v)} className={`p-2.5 rounded-xl border ${vm.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            {vm.mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {vm.mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => vm.setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-l p-6 flex flex-col shadow-2xl ${vm.theme === 'dark' ? 'bg-[#060606]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => vm.setMobileMenuOpen(false)} className={`p-2 rounded-lg ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}><X size={16} /></button>
            </div>
            <nav className="space-y-3">
              {visibleNav.map((item) => (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => vm.navigateAndCloseMobile(item.path)}
                    className={`w-full min-h-12 flex items-center gap-3 p-4 rounded-2xl font-black text-[11px] tracking-widest uppercase text-left ${
                      item.active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${vm.styles.subtext} hover:text-red-600`
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                  {item.id === 'dashboard' && (
                    <SupportMenuItem
                      currentUser={vm.user}
                      theme={vm.theme}
                      iconSize={18}
                      itemClassName={`w-full min-h-12 flex items-center gap-3 p-4 rounded-2xl font-black text-[11px] tracking-widest uppercase text-left ${vm.styles.subtext} hover:text-red-600`}
                      panelClassName={vm.theme === 'dark'
                        ? 'ml-3 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'
                        : 'ml-3 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/80'}
                    />
                  )}
                </React.Fragment>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
              <button onClick={vm.toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${vm.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {vm.theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={vm.handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest">
                Encerrar Sessao
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex w-60 border-r ${vm.styles.sidebar} p-4 flex-col z-20 transition-all duration-300`}>
        <div className="mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">ASSISTENTE</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">AI Workspace</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {visibleNav.map((item) => (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => vm.navigate(item.path)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-left ${
                  item.active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${vm.styles.subtext} hover:text-red-600`
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
              {item.id === 'dashboard' && (
                <SupportMenuItem
                  currentUser={vm.user}
                  theme={vm.theme}
                  iconSize={18}
                  itemClassName={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-left ${vm.styles.subtext} hover:text-red-600`}
                  panelClassName={vm.theme === 'dark'
                    ? 'ml-3 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'
                    : 'ml-3 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/80'}
                />
              )}
            </React.Fragment>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={vm.toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${vm.theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            <span className="text-[10px] font-black uppercase">Tema</span>
            {vm.theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            <div className="overflow-hidden"><p className={`text-[8px] font-black uppercase ${vm.styles.subtext}`}>Usuario:</p><p className="text-sm font-black truncate italic leading-none">{vm.user.username}</p></div>
          </div>
          <button onClick={vm.handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-xs">
            <LogOut size={16} /> Encerrar Sessao
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-hidden z-10 flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-red-600/20 p-8 bg-gradient-to-br from-red-600/10 via-transparent to-transparent">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600/30 text-red-500 mb-5 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Consulta assistida por IA
            </div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">
              Assistente <span className="text-red-600">IA</span>
            </h2>
            <p className={`mt-4 text-sm md:text-base max-w-2xl ${vm.styles.subtext}`}>
              Posso consultar falhas, usuarios, avisos e KPIs em tempo real usando somente ferramentas de leitura do sistema.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {vm.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => vm.sendMessage(prompt)}
                  disabled={vm.loading}
                  className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                    vm.theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-100'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={`flex-1 min-h-0 rounded-[2.5rem] border p-4 sm:p-5 flex flex-col ${vm.styles.card}`}>
          <div className="flex-1 min-h-[360px] overflow-y-auto pr-2 space-y-4">
            {vm.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] sm:max-w-[75%] rounded-[1.8rem] px-4 py-3 border ${
                    isUser
                      ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-400/40'
                      : vm.theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {vm.loading && (
              <div className="flex justify-start">
                <div className={`rounded-[1.8rem] px-4 py-3 border ${vm.theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              vm.sendMessage(vm.input);
            }}
            className={`mt-4 border rounded-[2rem] p-2 flex items-end gap-2 ${vm.theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'}`}
          >
            <textarea
              value={vm.input}
              onChange={(event) => vm.setInput(event.target.value)}
              placeholder="Pergunte sobre falhas, usuarios, avisos ou KPIs..."
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none px-3 py-3 text-sm"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  vm.sendMessage(vm.input);
                }
              }}
            />
            <button
              type="submit"
              disabled={vm.loading || !vm.input.trim()}
              className={`h-12 min-w-12 px-4 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest ${
                vm.loading || !vm.input.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <SendHorizontal size={16} />
            </button>
          </form>
        </section>
      </main>

      <AppBottomNav isAdmin={vm.isAdmin} />
    </div>
  );
}
