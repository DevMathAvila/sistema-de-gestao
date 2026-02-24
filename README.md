🚀 Lenovo Asset Tracking System (ATS)
Sistema avançado de monitoramento e registro de falhas em tempo real para linhas de produção. O Lenovo ATS permite que técnicos registrem anomalias em setores específicos e que administradores gerenciem a equipe e visualizem estatísticas de falhas através de um Gráfico de Pareto inteligente.

🛠️ Stacks Utilizadas
O projeto foi construído utilizando o que há de mais moderno no ecossistema JavaScript para garantir performance, escalabilidade e uma interface de usuário (UI) de alto nível.

Frontend
React.js (Vite): Biblioteca principal para a construção da interface reativa.

Tailwind CSS: Framework utilitário para estilização personalizada, garantindo um design "Dark Mode" futurista e responsivo.

Lucide React: Pacote de ícones minimalistas e consistentes.

React Router DOM: Gerenciamento de rotas e navegação protegida.

Framer Motion / Tailwind Animate: Utilizados para transições suaves e animações de modais.

Backend & Database (BaaS)
Supabase: Alternativa open-source ao Firebase, utilizada para:

PostgreSQL: Banco de dados relacional robusto.

Supabase Auth (Simulado/Custom): Lógica de autenticação customizada via tabelas para controle granular de roles.

Real-time API: Consultas instantâneas para atualização do status da fábrica.

📋 Funcionalidades Implementadas
1. Autenticação e Segurança
Sistema de login com persistência via localStorage.

Role-Based Access Control (RBAC): Diferenciação entre usuários técnico e admin.

Proteção de rotas: Usuários não autorizados são redirecionados para o login ou impedidos de acessar o painel Admin.

2. Dashboard de Operações
Visualização em tempo real de 11 setores de teste (Runin 01 ao 10 e AVT).

Indicadores visuais de Anomalia Detectada com alertas em vermelho e animações.

Modal de alteração de senha integrada diretamente no perfil do usuário logado.

3. Registro e Visualização de Falhas
Fluxo simplificado para registro de ocorrências.

Tela de visualização histórica de falhas para consulta rápida dos técnicos.

4. Painel Administrativo (Admin)
Gestão de Equipe: Cadastro e exclusão de novos usuários com definição de permissões.

Relatório de Falhas (Pareto): Lógica inteligente que desmembra registros múltiplos (ex: "VGA, Rede") para contabilizar a frequência individual de cada componente defeituoso por setor.

🔧 Desafios Técnicos Superados (O que foi feito)
Durante o desenvolvimento, focamos em resolver gargalos críticos de arquitetura:

Padronização de IDs (BigInt vs UUID): Corrigimos um conflito onde o sistema tentava tratar IDs alfanuméricos como numéricos. Implementamos uma Lógica de ID Flexível que aceita ambos os formatos, evitando erros de sintaxe no PostgreSQL (NaN error).

Consistência de Dados: Ajustamos as queries do Supabase para garantir que a troca de senha e a exclusão de usuários apontassem para as colunas corretas (username, senha, id).

Performance: Otimizamos o useEffect para realizar buscas periódicas de falhas sem sobrecarregar a conexão com o banco de dados.

UI/UX: Design inspirado em interfaces industriais modernas, utilizando gradientes radiais, backdrops com desfoque (glassmorphism) e feedback visual de carregamento (Loader2).