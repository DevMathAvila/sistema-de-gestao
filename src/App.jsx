import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Registrar from './pages/Registrar'; // Verifique se o nome da pasta/arquivo está igual
import VisualizarFalhas from './pages/VisualizarFalhas';

function App() {
  return (
    <Routes>
      {/* Define a tela inicial como o Monitor Live */}
      <Route path="/" element={<VisualizarFalhas />} />
      <Route path="/dashboard" element={<VisualizarFalhas />} />
      
      {/* Rota para o formulário de registro */}
      <Route path="/registrar" element={<Registrar />} />
      
      {/* Caso acesse uma rota que não existe, volta para o monitor */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;