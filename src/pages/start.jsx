import React from 'react';
import { useNavigate } from 'react-router-dom';
import './start.css';
import logo from '../assets/logo_new.jpg'; 
import startButton from '../assets/start_button.jpg'; // 確保圖片路徑正確

function Start() {
  const navigate = useNavigate();

  return (
    <div className="start-container">
      <img src={logo} alt="Miraclegg Logo" className="logo" />
      <img 
        src={startButton} 
        alt="Start Button" 
        className="start-button" 
        onClick={() => navigate('/login')}
      />
    </div>
  );
}

export default Start;
