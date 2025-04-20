import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/login.css"; 

const REACT_APP_API = "https://my-react-game-server-0uk9.onrender.com";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 處理登入
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${REACT_APP_API}/checkUnique`, {
        params: { username }
      });
      if (res.data.exists) {
        // 記住使用者並跳轉
        localStorage.setItem('username', username);
        navigate("/home");
      } else {
        setError("帳號不存在，請先註冊！");
      }
    } catch (err) {
      setError("登入失敗：" + (err.response?.data?.message || err.message));
    }
  };

  // 處理註冊
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${REACT_APP_API}/createAccount`, {
        username,
        password,
      });
      localStorage.setItem('username', username);
      navigate("/home");
    } catch (err) {
      if (err.response?.status === 409) {
        setError("帳號已存在！");
      } else {
        setError("註冊失敗：" + (err.response?.data?.message || err.message));
      }
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

      <button className="pixel-button" onClick={handleLogin}>LOGIN</button>
      <button className="pixel-button" onClick={handleRegister}>REGISTER</button>
    </div>
  );
};

export default Login;