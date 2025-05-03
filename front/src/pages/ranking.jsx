import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/ranking.css';
const API_URL = "https://my-react-game-server-0uk9.onrender.com";
const rankIcons = ['👑', '🥈', '🥉'];
export default function Ranking() {
  const [players, setPlayers] = useState([]);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/leaderboard`);
        console.log(res.data);
        setPlayers(res.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const hours = Math.floor(player.timespan / 3600); 
  const minutes = Math.floor((player.timespan % 3600) / 60); 
  const seconds = player.timespan % 60;

  return (
    <div className="ranking-container">
      <h1 className="ranking-title">🏆 排行榜</h1>
      <div className="ranking-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.username}
            className={`ranking-item ${
              index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''
            }`}
          >
            <div className="rank-left">
              <span className="rank-icon">{rankIcons[index] || index + 1}</span>
              <span className="player-name">{player.username}</span>
            </div>
            <div className="rank-right">
              <div>❤️ HP: {player.hp}</div>
              <div>⭐ Score: {player.score}</div>
             <div>⏳ Time Spent: {hours}:{minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}