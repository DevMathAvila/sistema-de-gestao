// INSTRUCAO AO DESENVOLVEDOR:
// Sempre que adicionar uma nova versao:
// 1. Atualize NEWS_VERSION_LATEST para a nova versao
// 2. Adicione a entrada no inicio do array NEWS_DATA
// 3. Atualize public/version.json com a mesma versao
// 4. Faca o deploy - o popup aparecera automaticamente para todos os usuarios logados

export const NEWS_VERSION_LATEST = '1.2.0';

export const NEWS_DATA = [
  {
    version: '1.2.0',
    date: '2026-03-17',
    title: 'Alerta visual para pontos inoperantes',
    type: 'improvement',
    summary: 'Agora os pontos inoperantes aparecem com aviso laranja pulsante no quadrado do ponto em Registrar e Visualizar Falhas.',
    items: [
      'Badge laranja pulsante no proprio quadrado do ponto',
      'Tooltip com falhas atuais + indicador de inoperante no hover',
      'Destaque imediato para reduzir abertura de chamado em ponto ja inoperante',
      'Mesmo comportamento em Registrar Falhas e Visualizar Falhas',
    ],
    details: `
Foi adicionada uma camada de visibilidade para pontos inoperantes, focada em reduzir erros operacionais na abertura e no acompanhamento de chamados.

**O que mudou:**
- Em **Registrar Falhas**, ao navegar pelos pontos da trave, qualquer ponto marcado como inoperante exibe um aviso laranja pulsante no proprio quadrado.
- Em **Visualizar Falhas**, o mesmo indicador aparece no mapa de pontos para manter a leitura consistente entre os fluxos.

**Como funciona:**
- O sistema identifica inoperancia ativa por ponto e adiciona um destaque visual no card daquele ponto.
- No hover, o tooltip mostra:
  - falhas ja registradas para o ponto
  - indicador de inoperante (ex.: \`RJ45 P. Inop\`)
  - motivo/observacao de inoperancia, quando existir

**Para que serve:**
- Evita que um ponto inoperante passe despercebido durante novo registro.
- Melhora a decisao rapida de manutencao no chao de fabrica.
- Padroniza a leitura operacional entre os modulos de registro e monitoramento.
    `,
  },
  {
    version: '1.1.0',
    date: '2026-03-13',
    title: 'Lei.A - Assistente Virtual de IA',
    type: 'feature',
    summary: 'Conheca a Lei.A, sua nova assistente virtual integrada ao sistema. Em fase de testes com perguntas limitadas por periodo.',
    items: [
      'Widget flutuante com chat persistente em todas as telas',
      'Consulta de falhas, KPIs e avisos em tempo real via IA',
      'Respostas em portugues sobre o funcionamento do sistema',
      'Integracao segura via tool calling - somente leitura',
    ],
    details: `
A Lei.A e a assistente virtual oficial do Lenovo Assets Systems, criada pelo desenvolvedor Matheus Avila para auxiliar a equipe operacional da Lenovo Indaiatuba.

**Como acessar:** Clique na bolinha pulsante no canto inferior direito da tela - ela estara presente em todas as paginas.

**O que ela pode fazer:**
- Consultar falhas abertas e concluidas por setor e periodo
- Gerar resumos de KPIs operacionais
- Responder perguntas sobre como usar o sistema
- Orientar sobre abertura e conclusao de falhas

**Fase de testes - perguntas limitadas:** A Lei.A utiliza o plano gratuito da API Gemini, com limite de requisicoes por periodo. Se nao responder imediatamente, aguarde e tente novamente.

**Seguranca:** A Lei.A opera com acesso somente leitura. Ela nao cria, edita ou exclui nenhum dado do sistema.
    `,
  },
  {
    version: '1.0.0',
    date: '2026-03-03',
    title: 'Lancamento do Lenovo Assets Systems',
    type: 'feature',
    summary: 'O sistema entra em operacao! Gestao completa de falhas operacionais da linha Lenovo Indaiatuba.',
    items: [
      'Registro e conclusao de falhas por setor',
      'Dashboard de KPIs em tempo real',
      'Integracao com SIGA para chamados eletricos',
      'Controle de pontos inoperantes',
      'Gestao de usuarios com perfis de acesso distintos',
    ],
    details: `
O Lenovo Assets Systems foi desenvolvido por Matheus Avila e entrou em operacao em 03 de marco de 2026 na unidade de Indaiatuba, SP.

**Proposito:** Auxiliar e reduzir danos e custos na linha Lenovo, resolvendo diretamente o impacto nas linhas de producao.

**O que esta disponivel:**
- Abertura de chamados por qualquer usuario
- Visualizacao e conclusao de falhas por tecnicos e admins
- Integracao com SIGA para falhas eletricas
- Marcacao de pontos inoperantes para acompanhamento
- Dashboard com metricas operacionais em tempo real
- Perfis de acesso: master, admin, tecnico, colaborador, runin_kiosk
    `,
  },
];
