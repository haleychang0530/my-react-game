import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Ranking = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/leaderboard`);
        setLeaderboard(response.data); 
        setLoading(false); 
      } catch (err) {
        setError('Failed to fetch leaderboard data');
        setLoading(false); 
    };

    fetchLeaderboard();
  }, []); 

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Ranking</h1>
      <div>
        <h2>Top 3 Players</h2>
        {leaderboard.slice(0, 3).map((player, index) => (
          <p key={player.id}>
            {index + 1}st Place: {player.username} - {player.score} points
          </p>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Score</th>
            <th>Pet Status</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player) => (
            <tr key={player.id}>
              <td>{player.id}</td>
              <td>{player.username}</td>
              <td>{player.score}</td>
              <td>{player.hp > 0 ? 'Healthy' : 'Unhealthy'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/home')}>Home</button>
      <button onClick={() => navigate('/game')}>Game</button>
    </div>
  );
};

export default Ranking;
