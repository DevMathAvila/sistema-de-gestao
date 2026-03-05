# Sistema de Gestao de Falhas

Esse projeto e um app React + Vite pra operar e gerenciar falhas (abrir chamado, monitorar, fechar, ver historico, admin, KPI e fluxo SIGA). Nao e perfeito ainda, mas ta ficando redondo.

## Stack (na pratica)
- React
- Vite
- Supabase
- Tailwind CSS
- Recharts
- XLSX (carregado so quando precisa)

## Como ta organizado

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

## O que ele faz (resumao)

### Falhas
- Abre chamado por setor/trave/ponto.
- Mostra alertas operacionais.
- Fecha falha com controle de permissao.

### SIGA
- Botao `Enviar para SIGA` na falha.
- Sai do mapa de operacao, mas continua aberto no banco.
- Painel SIGA com `Aguardando` e `Finalizados`.
- Confirmacao antes de finalizar.

### Admin
- Gest�o de usuarios.
- Pareto de falhas.
- Historico de abertas/concluidas com exportacao Excel.

### Dashboard KPI
- Abas: `Executivo`, `Operacao`, `SIGA`, `Historico`.
- Graficos de volume/status.
- Ranking e insights por setor.
- Aging de pendencias.
- KPI SIGA com totais/pendentes/fechados.
- Exportacao PDF com presets.

## Regras importantes (que eu mesmo esque�o)

### Filtro de data (DateRangePicker)
- Usa rascunho local.
- So aplica ao clicar em `Aplicar`.

### KPI SIGA (tempo)
- `Tempo total` e `Media por chamado` = so finalizados.
- `Em andamento agora` fica separado e nao entra na media.

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

Pra o fluxo SIGA funcionar, a tabela `public.registros_falhas` precisa dessas colunas:
- `siga_enviado` (boolean)
- `siga_status` (text)
- `siga_enviado_em` (timestamp)
- `siga_codigo_chamado` (text)
- `siga_data_abertura` (date)
- `siga_finalizado_em` (timestamp)

## Qualidade e performance (o basico)
- Code splitting com `React.lazy` em rotas e blocos pesados.
- Cache/deduplicacao no hook do KPI.
- Import dinamico pra exportacao (PDF/Excel).
- Mobile responsivo com ajustes de navegacao inferior e notificacoes.

