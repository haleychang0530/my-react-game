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
  console.log('API base URL:', API_URL);
  const handleLogin = async (e) => {
  /*  if (username === "test" && password === "1234") {
      navigate("/home");
    } else {
      setError("❌ Wrong username or password!");

    () => navigate("/register")}> 
  */ 
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      navigate("/home");
    } catch (err) {
      setError('登入失敗: ' + err.response.data.message);
    }
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
