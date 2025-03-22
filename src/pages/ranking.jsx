
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Ranking = () => {
  const navigate = useNavigate();  

  return (
    <div>
      <h1>Ranking</h1>
      <div>
        <h2>Top 3 Players</h2>
        <p>1st Place: Player 1</p>
        <p>2nd Place: Player 2</p>
        <p>3rd Place: Player 3</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pet Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Healthy</td>
          </tr>
          {/* 其他玩家排名 */}
        </tbody>
      </table>
      <button onClick={() => navigate('/home')}>Home</button>  {/* 使用 navigate */}
      <button onClick={() => navigate('/game')}>Game</button>  {/* 使用 navigate */}
    </div>
  );
};

export default Ranking;
