import React from 'react'; // Adicionado de volta para evitar o ReferenceError
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Registrar from './pages/Registrar'; 
import VisualizarFalhas from './pages/VisualizarFalhas'; 
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem('lenovo_user'));
  return isAuthenticated ? children : <Navigate replace to="/" />;
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

          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;