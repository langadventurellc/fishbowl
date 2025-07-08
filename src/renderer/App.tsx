import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { Settings } from './components/Settings';
import { Chat } from './components/Chat';
import { DevTools } from './components/DevTools';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
      <DevTools />
    </Router>
  );
};
