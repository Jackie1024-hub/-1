
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import TeacherPortal from './pages/TeacherPortal';
import StudentPortal from './pages/StudentPortal';
import GameView from './pages/GameView';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="bg-blue-500 p-1 rounded">Si</span> 芯农实验室
          </Link>
          <nav className="flex gap-4">
            <Link to="/teacher" className="text-sm hover:text-blue-300 transition">老师端</Link>
            <Link to="/student" className="text-sm hover:text-blue-300 transition">学生端</Link>
          </nav>
        </header>
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacher" element={<TeacherPortal />} />
            <Route path="/student" element={<StudentPortal />} />
            <Route path="/game/:code/:nickname" element={<GameView />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t p-4 text-center text-xs text-slate-500">
          &copy; 2024 芯农实验室 - 课堂模拟版 (Local Storage Powered)
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
