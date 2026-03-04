# Sistema de Gestao de Falhas

Aplicacao React + Vite para operacao e gestao de falhas (abertura, monitoramento, historico, administracao, KPI e fluxo SIGA).

## Stack
- React
- Vite
- Supabase
- Tailwind CSS
- Recharts
- XLSX (carregado sob demanda)

## Arquitetura (SoC / Features)

```txt
src/
  app/
    router/
      AppRouter.jsx

  core/
    api/
      supabaseClient.js
      supabaseSecure.js
    auth/
      session.js
    theme/
      theme.jsx
      theme.js
    validation/
      validation.js

  shared/
    components/
      filters/
        DateRangePicker.jsx
      layout/
        AppBottomNav.jsx
    constants/
      setores.js
      falhasComuns.js
    hooks/
      usePersistentTheme.js
      useBodyScrollLock.js

  features/
    admin/
      components/
      constants/
      hooks/
      pages/
      services/
      styles/
    auth/
      hooks/
      pages/
      services/
    dashboard/
      components/
      constants/
      hooks/
      pages/
      services/
    failures/
      components/
      constants/
      hooks/
      pages/
      services/
      styles/
    home/
      hooks/
      pages/
      services/
    monitoring/
      hooks/
      pages/
      services/
```

## Funcionalidades principais

### Falhas
- Abertura de chamados por setor/trave/ponto.
- Visualizacao operacional com alertas recorrentes.
- Encerramento de falhas com controle por permissao.

### SIGA
- Acao `Enviar para SIGA` na falha.
- Item sai da visao operacional, permanece aberto no banco.
- Painel SIGA com `Aguardando` e `Finalizados`.
- Confirmacao visual antes de finalizar chamado SIGA.

### Admin
- Gestao de usuarios.
- Pareto de falhas.
- Historico de abertas/concluidas com exportacao Excel.

### Dashboard KPI
- Cockpit por abas: `Executivo`, `Operacao`, `SIGA`, `Historico`.
- Graficos de volume/status.
- Ranking e insights por setor.
- Aging de pendencias.
- KPI SIGA com totais/pendentes/fechados.
- Exportacao PDF configuravel por secoes e presets.

## Regras atuais importantes

### Filtro de data (DateRangePicker)
- O filtro usa rascunho local.
- A tela so atualiza ao clicar em `Aplicar`.
- Evita refresh durante selecao de mes/dia.

### KPI SIGA (tempo)
- `Tempo total` e `Media por chamado` usam somente chamados finalizados.
- `Em andamento agora` aparece separado e nao entra na media.

## Rotas principais
- `/` login
- `/dashboard`
- `/abrir-chamado`
- `/registrar`
- `/visualizar`
- `/admin`
- `/admin/cockpit`
- `/monitor-tv`
- `/alterar-senha`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Banco de dados (SIGA)

Para o fluxo SIGA funcionar, a tabela `public.registros_falhas` precisa das colunas:
- `siga_enviado` (boolean)
- `siga_status` (text)
- `siga_enviado_em` (timestamp)
- `siga_codigo_chamado` (text)
- `siga_data_abertura` (date)
- `siga_finalizado_em` (timestamp)

## Qualidade e performance
- Code splitting com `React.lazy` em rotas e blocos pesados.
- Cache e deduplicacao de dataset KPI no hook.
- Import dinamico para exportacoes (PDF/Excel).
- Mobile responsivo com ajustes de navegacao inferior e notificacoes.

