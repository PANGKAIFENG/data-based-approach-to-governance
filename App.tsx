import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import TaskDetail from './pages/TaskDetail';
import StyleGenerator from './pages/StyleGenerator';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/data-governance" element={<TaskManagement />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/style-task/:id" element={<StyleGenerator />} />
        <Route path="/style-generator" element={<StyleGenerator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
