import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";  // 確保是正確的相對路徑
 // 這裡連結像素風 CSS

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username === "test" && password === "1234") {
      navigate("/home");
    } else {
      setError("❌ Wrong username or password!");
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
      <button className="pixel-button" onClick={() => navigate("/register")}>
        REGISTER
      </button>
    </div>
  );
};

export default Login;
