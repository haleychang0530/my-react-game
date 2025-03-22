
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar'

const Home = () => {
  const navigate = useNavigate(); 

  const handleChangeOutfit = () => {
    // 換裝
  };

  return (
    <div>
        <h2>Pet Status</h2>
        <p>HP: 100</p>
        <p>Score: 200</p>
        <p>Record: 50</p>
        <button onClick={handleChangeOutfit}>Change Outfit</button>
    
    </div>
  );
};

export default Home;
