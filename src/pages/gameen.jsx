
import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameEn = () => {
  const navigate = useNavigate();  

  return (
    <div>
      <h1>Game</h1>
      <div>
        <button onClick={() => console.log('Start Chinese Mode')}>Chinese Mode</button>
        <button onClick={() => console.log('Start English Mode')}>English Mode</button>
      </div>
      <button onClick={() => navigate('/home')}>Home</button>  {/* 使用 navigate */}
      <button onClick={() => navigate('/ranking')}>Ranking</button>  {/* 使用 navigate */}
    </div>
  );
};

export default GameEn;
