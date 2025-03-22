import React from 'react';
import { useNavigate } from 'react-router-dom';

function Start() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/login'); 
  };

  return (
    <div>
      <h1>Welcome to My React Game!</h1>
      <button onClick={handleStartClick}>Start</button>
    </div>
  );
}

export default Start;
