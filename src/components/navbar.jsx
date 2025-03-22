// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li className="logo">
          <img src="path-to-your-logo.png" alt="Logo" />
        </li>
          <li><Link to="/home">首頁🐣</Link></li>
          <li><Link to="/ranking">排行榜🪽</Link></li>
          <li><Link to="/gamech">中文練習🐤</Link></li>
          <li><Link to="/gameen">英文練習🐥</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
