import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/gamech.css"; 

// 寫死五個題目
const questions = [
  { question: 'ㄉㄚˋ', options: ['大', '太'], answer: '大' },
  { question: 'ㄨㄛˇ', options: ['我', '找'], answer: '我' },
  { question: 'ㄖˋ', options: ['日', '曰'], answer: '日' },
  { question: 'ㄕㄣ', options: ['甲', '申'], answer: '申' },
  { question: 'ㄨㄟˋ', options: ['末', '未'], answer: '未' },
];

const ChooseAnswerGame = () => {
  const [score, setScore] = useState(0);  // 記錄得分
  const [currentIndex, setCurrentIndex] = useState(0); // 當前題目索引
  const [gameOver, setGameOver] = useState(false); // 控制遊戲是否結束
  const navigate = useNavigate(); // 用於頁面導航

  const currentQuestion = questions[currentIndex];  // 當前題目

  const handleOptionClick = (selectedOption) => {
    if (selectedOption === currentQuestion.answer) {
      setScore(score + 1); // 正確的選項加分
    }

    // 下一題或遊戲結束
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1); // 顯示下一題
      } else {
        setGameOver(true); // 遊戲結束
      }
    }, 1000);
  };

  const resetGame = () => {
    setScore(0);
    setCurrentIndex(0);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <h1>得分: {score}</h1>
      {gameOver ? (
        <div className="game-over">
          <h2>遊戲結束！最終得分: {score}</h2>
          <button onClick={resetGame}>重新開始</button>
        </div>
      ) : (
        <div className="question-container">
          <h2>{currentQuestion.question}</h2>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button 
                key={index} 
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseAnswerGame;
