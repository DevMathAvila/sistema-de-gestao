import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Registrar from './pages/Registrar'; 
import VisualizarFalhas from './pages/VisualizarFalhas'; 
import Admin from './pages/Admin'; // IMPORTANTE: Importando o novo Admin

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('lenovo_user');
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505]">
        <Routes>
          <Route path="/" element={<Login />} />

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

          {/* NOVA ROTA: Painel Administrativo */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;