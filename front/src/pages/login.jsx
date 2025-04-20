import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/login.css"; 

const API_URL = "https://my-react-game-server-0uk9.onrender.com";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try{
        const response = await axios.post(`${API_URL}/createAccount`, {username, password});
    } 
    catch(err){
          const msg = err.response?.data?.message || "未知錯誤";
          setError("發生錯誤： " + msg);
    }
    localStorage.setItem("username", username);
    navigate("/home"); 
  };

  return (
    <div className="pixel-container">
      <h1 className="pixel-title">LOGIN🍳</h1>
      <input
        type="text"
        className="pixel-input"
        placeholder="USERNAME"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="pixel-input"
        placeholder="PASSWORD"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="pixel-error">{error}</p>}
      <button className="pixel-button" onClick={handleLogin}>
        LOGIN
      </button>
      <button className="pixel-button" onClick={handleLogin}>
        REGISTER
      </button>
    </div>
  );
};

export default Login;
