import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaskManagement from './pages/TaskManagement';
import TaskDetail from './pages/TaskDetail';
import StyleGenerator from './pages/StyleGenerator';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskManagement />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/style-generator" element={<StyleGenerator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
