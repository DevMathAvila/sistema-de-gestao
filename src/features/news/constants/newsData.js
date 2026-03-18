// INSTRUCAO AO DESENVOLVEDOR:
// Sempre que adicionar uma nova versao:
// 1. Atualize NEWS_VERSION_LATEST para a nova versao
// 2. Adicione a entrada no inicio do array NEWS_DATA
// 3. Atualize public/version.json com a mesma versao
// 4. Faca o deploy - o popup aparecera automaticamente para todos os usuarios logados

export const NEWS_VERSION_LATEST = '1.4.1';

export const NEWS_DATA = [
  {
    version: '1.4.1',
    date: '2026-03-18',
    title: 'Lei.A mais autonoma, mais rapida e mais alinhada ao sistema',
    type: 'improvement',
    summary: 'A Lei.A recebeu uma grande evolucao: agora entende melhor os pedidos, faz menos perguntas desnecessarias e esta aprendendo a responder de forma mais natural dentro da rotina operacional.',
    items: [
      'Menos voltas na conversa para consultas simples do dia a dia',
      'Leitura mais inteligente de periodo, setores e situacoes operacionais',
      'Melhor entendimento sobre falhas abertas, concluidas e pontos inoperantes',
      'Uso mais eficiente das requisicoes para aumentar a disponibilidade do assistente',
    ],
    details: `
A Lei.A recebeu uma atualizacao importante para ficar mais proxima da rotina real da operacao e responder com mais autonomia.

**O que mudou:**
- Agora ela esta mais preparada para entender pedidos diretos sem ficar travando a conversa com perguntas repetidas.
- A leitura de contexto ficou mais inteligente, especialmente para consultas sobre falhas, historicos, setores e pontos inoperantes.
- O comportamento geral foi ajustado para que a interacao fique mais fluida, natural e objetiva.

**Como isso aparece no uso diario:**
- Em perguntas simples, a resposta tende a vir com menos etapas e menos interrupcoes.
- A Lei.A esta se ajustando melhor ao jeito como os colaboradores realmente perguntam no dia a dia.
- O assistente ficou mais alinhado ao funcionamento do sistema e ao vocabulario operacional da fabrica.

**O que tambem foi melhorado:**
- Reducao no volume de requisicoes desnecessarias para ajudar a preservar disponibilidade de uso.
- Melhor equilibrio entre velocidade de resposta e qualidade da consulta.
- Evolucao continua no entendimento do sistema, com foco em falhas, inoperancias, indicadores e contexto operacional.

**Por que isso importa:**
- Diminui atrito na conversa.
- Aumenta a chance de respostas uteis logo na primeira tentativa.
- Faz com que a Lei.A acompanhe melhor a realidade do sistema enquanto continua aprendendo a responder e interagir com os usuarios.
    `,
  },
  {
    version: '1.3.0',
    date: '2026-03-17',
    title: 'Arquivo completo de novidades e historico do sistema',
    type: 'feature',
    summary: 'O Dashboard agora possui acesso a uma pagina dedicada com todo o historico de atualizacoes do sistema, em estilo de arquivo Lenovo.',
    items: [
      'Botao "Visualizar todas" na secao Lenovo News do Dashboard',
      'Nova pagina /novidades com visual inspirado em forum antigo e mural tecnico',
      'Historico exibido com as novidades mais recentes no topo',
      'Leitura centralizada das evolucoes do sistema em um unico lugar',
    ],
    details: `
Foi criada uma pagina dedicada para centralizar o historico de evolucao do Lenovo Assets Systems, sem perder o comportamento atual do Dashboard.

**O que mudou:**
- O Dashboard continua exibindo apenas as **2 ultimas novidades**.
- A secao **Lenovo News** agora possui o CTA **Visualizar todas**, levando para uma nova pagina de arquivo.
- A nova pagina mostra todas as atualizacoes registradas no sistema, com as mais recentes primeiro.

**Como funciona:**
- O popup de novidade e o Dashboard seguem usando a versao mais recente como referencia.
- A pagina de arquivo reutiliza essas mesmas entradas para montar o historico completo do produto.

**Por que essa pagina existe:**
- Facilita onboarding de usuarios e novas IAs no projeto.
- Cria um historico visivel das entregas implementadas ao longo do tempo.
- Melhora a transparencia do produto sem poluir o Dashboard principal.
    `,
  },
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
