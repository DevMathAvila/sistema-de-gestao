import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Registrar from './pages/Registrar'; 
import VisualizarFalhas from './pages/VisualizarFalhas'; 
import Admin from './pages/Admin'; 
import MonitorTV from './components/MonitorTV'; // IMPORTANTE: Importando a nova tela de TV

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('lenovo_user');
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505]">
        <Routes>
          {/* Rota de Login */}
          <Route path="/" element={<Login />} />

          {/* Rota do Dashboard Principal */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Rota para Cadastrar Nova Falha */}
          <Route 
            path="/registrar" 
            element={
              <PrivateRoute>
                <Registrar />
              </PrivateRoute>
            } 
          />

          {/* Rota para Monitoramento e Interação (Live Monitor) */}
          <Route 
            path="/visualizar" 
            element={
              <PrivateRoute>
                <VisualizarFalhas />
              </PrivateRoute>
            } 
          />

          {/* Rota: Painel Administrativo */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />

          {/* NOVA ROTA: Monitor para TV 
            Esta rota está FORA do PrivateRoute para que a TV não precise de login constante.
            Ela é puramente visual e segura (apenas leitura).
          */}
          <Route path="/monitor-tv" element={<MonitorTV />} />

          {/* Redirecionamento para rotas inexistentes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;