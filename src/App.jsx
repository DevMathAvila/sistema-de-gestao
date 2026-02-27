import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registrar from './pages/Registrar';
import VisualizarFalhas from './pages/VisualizarFalhas';
import Admin from './pages/Admin';
import MonitorTV from './components/MonitorTV';

const PrivateRoute = ({ children }) => {
  try {
    const stored = localStorage.getItem('lenovo_user');
    if (!stored) return <Navigate to="/" replace />;
    const user = JSON.parse(stored);
    if (!user || typeof user.username !== 'string') return <Navigate to="/" replace />;
    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Routes>
        <Route path="/monitor-tv" element={<MonitorTV />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/registrar" element={<PrivateRoute><Registrar /></PrivateRoute>} />
        <Route path="/visualizar" element={<PrivateRoute><VisualizarFalhas /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
