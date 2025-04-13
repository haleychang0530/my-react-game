import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import Navbar from './components/navbar';  // 引入 Navbar
import Start from './pages/start';
import Login from './pages/login';
import Home from './pages/home';
import Ranking from './pages/ranking';
import GameEn from './pages/gameen';
import GameCh from './pages/gamech';

function App() {
  return (
    <Router> {/* 確保 Router 組件包裹整個應用 */}
      <Routes>
        <Route path="/" element={<Start />} />  
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PageWithNavbar><Home /></PageWithNavbar>} />
        <Route path="/gameen" element={<PageWithNavbar><GameEn /></PageWithNavbar>} />
        <Route path="/gamech" element={<PageWithNavbar><GameCh /></PageWithNavbar>} />
        <Route path="/ranking" element={<PageWithNavbar><Ranking /></PageWithNavbar>} />
      </Routes>
    </Router>
  );
}

// 封裝Navbar顯示邏輯的組件
const PageWithNavbar = ({ children }) => {
  const location = useLocation();  // 使用 useLocation 來獲取當前路由
  
  return (
    <div>
      {/* 只有在 /home、/game、/ranking 顯示 Navbar */}
      {(location.pathname === '/home' || location.pathname === '/gameen' || location.pathname === '/ranking' || location.pathname === '/gamech') && <Navbar />}
      {children}
    </div>
  );
};

export default App;
