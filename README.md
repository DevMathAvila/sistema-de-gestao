📋 Funcionalidades Implementadas
1. Inteligência Visual & Prevenção de Erros (Novo ✨)
Mapeamento de Trave Neon: Identificação instantânea de pendências. Ao selecionar uma trave, o sistema aplica um efeito de brilho (Glow) vermelho neon caso existam chamados abertos.

Flags de Pontos (PT) em Tempo Real: Pontos com falhas são destacados com ícones de alerta e animações de pulsação, diferenciando-se visualmente de pontos livres.

Tooltips Acumulativos: Lógica inteligente que agrupa falhas. Ao passar o mouse sobre um ponto com erro, o sistema exibe um balão informando todos os problemas ativos (ex: "Rede (RJ45), VGA"), evitando registros duplicados.

Persistência de Seleção: O técnico pode optar por abrir um novo chamado em um ponto já ocupado se o diagnóstico for diferente, garantindo total flexibilidade operacional.

2. Painel Administrativo (Business Intelligence)
Gráfico de Pareto Automatizado: Algoritmo que desmembra registros múltiplos para contabilizar a frequência individual de cada componente defeituoso por setor.

Gestão de Equipe (RBAC): Controle de acesso baseado em funções (Admin/Técnico) com permissões granulares para cadastro e exclusão de usuários.

Gestão de Segurança: Sistema de alteração de senhas integrado e validação de sessão em tempo real.

3. Registro e Monitoramento
Dashboard em Tempo Real: Visualização de 11 setores de teste com indicadores de anomalia dinâmicos.

Multi-Seleção de Pontos: Ferramenta para selecionar toda a trave ou pontos individuais com um único clique.

🛠️ Stacks Utilizadas
Frontend
React.js (Vite): Core para renderização reativa e alta performance.

Tailwind CSS: Design "Dark Mode" futurista com backdrops de desfoque (Glassmorphism).

Lucide React: Iconografia minimalista e consistente.

Framer Motion / Tailwind Animate: Transições suaves e feedback visual de estados.

Backend & Database (BaaS)
Supabase: Infraestrutura escalável operando com:

PostgreSQL: Banco de dados relacional com consultas complexas.

Real-time API: Sincronização instantânea do status da fábrica sem necessidade de refresh manual.

🔧 Desafios Técnicos Superados
Lógica de Detecção Acumulada: Implementação de busca em strings complexas para identificar pontos específicos dentro de registros múltiplos (ex: extrair "Ponto 1" de uma string "Ponto 1, Ponto 2").

Normalização de Tipagem no DB: Resolução de conflitos de IDs alfanuméricos vs numéricos (UUID vs BigInt), garantindo integridade nas chaves estrangeiras.

UX Industrial: Desenvolvimento de uma interface que prioriza a "escaneabilidade", permitindo que o técnico identifique problemas na linha com apenas um olhar.

📦 Dependências Principais
JSON
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "latest",
    "framer-motion": "latest",
    "recharts": "latest"
  }
}
🚀 Como Executar
Clonagem: git clone [url-do-repositorio]

Dependências: npm install

Ambiente: Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.

Deploy Local: npm run dev

Desenvolvido para máxima eficiência e precisão técnica.