import React from 'react';
import './css/ranking.css'; // 匯入像素風CSS

const playerData = [
  { name: 'Anryl', hp: 80, score: 1500 },
  { name: '123', hp: 95, score: 1800 },
  { name: 'Test3', hp: 60, score: 1200 },
  { name: 'AnYI', hp: 70, score: 1400 },
  { name: 'Chen', hp: 100, score: 2000 },
];

const sortedPlayers = [...playerData].sort((a, b) => b.score - a.score);

const rankIcons = ['👑', '🥈', '🥉'];

export default function Ranking() {
  return (
    <div className="ranking-container">
      <h1 className="ranking-title">🏆 排行榜</h1>
      <div className="ranking-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.name}
            className={`ranking-item ${
              index === 0
                ? 'first'
                : index === 1
                ? 'second'
                : index === 2
                ? 'third'
                : ''
            }`}
          >
            <div className="rank-left">
              <span className="rank-icon">{rankIcons[index] || index + 1}</span>
              <span className="player-name">{player.name}</span>
            </div>
            <div className="rank-right">
              <div>❤️ HP: {player.hp}</div>
              <div>⭐ Score: {player.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
