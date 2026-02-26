import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Registrar from './pages/Registrar'; 
import VisualizarFalhas from './pages/VisualizarFalhas'; 
import Admin from './pages/Admin'; 
import MonitorTV from './components/MonitorTV'; 

// Componente de Proteção
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('lenovo_user');
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505]">
        <Routes>
          {/* 1. ROTA PÚBLICA (Sempre no topo para prioridade total) */}
          <Route path="/monitor-tv" element={<MonitorTV />} />

          {/* 2. ROTA DE LOGIN */}
          <Route path="/" element={<Login />} />

          {/* 3. ROTAS PROTEGIDAS */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/registrar" 
            element={
              <PrivateRoute>
                <Registrar />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/visualizar" 
            element={
              <PrivateRoute>
                <VisualizarFalhas />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />

          {/* 4. REDIRECIONAMENTO DE SEGURANÇA */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;