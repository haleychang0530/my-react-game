import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/gamech.css";

// 題目資料
const questions = [
  { question: 'ㄉㄚˋ', options: ['大', '太'], answer: '大' },
  { question: 'ㄨㄛˇ', options: ['我', '找'], answer: '我' },
  { question: 'ㄖˋ', options: ['日', '曰'], answer: '日' },
  { question: 'ㄕㄣ', options: ['甲', '申'], answer: '申' },
  { question: 'ㄨㄟˋ', options: ['末', '未'], answer: '未' },
];

const ChooseAnswerGame = () => {
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const navigate = useNavigate();
  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return; // 避免重複點擊

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setSelectedStatus(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setSelectedStatus(null);
      } else {
        setGameOver(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setScore(0);
    setCurrentIndex(0);
    setGameOver(false);
    setSelectedOption(null);
    setSelectedStatus(null);
  };

  return (
    <div className="game-wrapper">
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
                  disabled={selectedOption !== null}
                  className={`option-button ${
                    selectedOption === option
                      ? selectedStatus === 'correct'
                        ? 'correct'
                        : 'wrong'
                      : ''
                  }`}
                >
                  {option}
                  {selectedOption === option && selectedStatus === 'correct' && ' ✔️'}
                  {selectedOption === option && selectedStatus === 'wrong' && ' ❌'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseAnswerGame;
