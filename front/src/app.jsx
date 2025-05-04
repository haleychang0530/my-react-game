import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/navbar'; // 引入 Navbar
import Start from './pages/start';
import Login from './pages/login';
import Home from './pages/home';
import Ranking from './pages/ranking';
import GameEn from './pages/gameen';
import GameCh from './pages/gamech';
import WritingCh from './pages/writingch';
import MailPage from './pages/MailPage';

// 假設登出 API 的函數
const logout = (username) => {
  fetch('https://my-react-game-server-0uk9.onrender.com/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: username }),
  })
    .then((response) => response.json())
    .catch((error) => console.error('Logout failed:', error));
};

function App() {
  return (
    <Router> {/* 確保 Router 組件包裹整個應用 */}
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PageWithNavbar><Home /></PageWithNavbar>} />
        <Route path="/gameen" element={<PageWithNavbar><GameEn /></PageWithNavbar>} />
        <Route path="/gamech" element={<PageWithNavbar><GameCh /></PageWithNavbar>} />
        <Route path="/writingch" element={<PageWithNavbar><WritingCh /></PageWithNavbar>} />
        <Route path="/ranking" element={<PageWithNavbar><Ranking /></PageWithNavbar>} />
        <Route path="/MailPage" element={<PageWithNavbar><MailPage/></PageWithNavbar>} />
       
      </Routes>
    </Router>
  );
}

// 封裝Navbar顯示邏輯的組件
const PageWithNavbar = ({ children }) => {
  const username = localStorage.getItem("username");  

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      logout(username);

      const message = '確定不玩了嗎?';
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [username]);

  return (
    <div>
      {/* 只有在 /home、/game、/ranking、/writingch 顯示 Navbar */}
      {(location.pathname === '/home' || location.pathname === '/gameen' || location.pathname === '/ranking' || location.pathname === '/gamech' || location.pathname === '/writingch' || location.pathname === '/MailPage') && <Navbar />}
      {children}
    </div>
  );
};

export default App;
