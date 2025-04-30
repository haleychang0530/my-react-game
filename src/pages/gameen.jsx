import React, { useState, useRef, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import "./css/gameen.css";

const WORDS = ['dog', 'c']; // 預設單字列表

function gameen() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showWord, setShowWord] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const canvasRef = useRef(null);

  const currentWord = WORDS[currentWordIndex];
  const currentLetter = currentWord[currentLetterIndex];

  // 顯示單字後隱藏
  useEffect(() => {
    if (showWord) {
      const timer = setTimeout(() => {
        setShowWord(false); // 顯示 2 秒後隱藏題目
      }, 2000); // 顯示2秒後隱藏
      return () => clearTimeout(timer);
    }
  }, [showWord]);

  // 檢查用戶輸入的字母
  const checkLetter = async () => {
    if (!canvasRef.current) return;
    
    // 暫時使用prompt來模擬識別
    const recognizedLetter = prompt('請輸入您畫的字母:').toLowerCase();
    
    if (recognizedLetter === currentLetter.toLowerCase()) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      
      // 檢查是否完成當前單字
      if (currentLetterIndex === currentWord.length - 1) {
        // 檢查是否是最後一個單字
        if (currentWordIndex === WORDS.length - 1) {
          setGameCompleted(true);
        } else {
          // 切換到下一個單字
          setTimeout(() => {
            setCurrentWordIndex(prev => prev + 1);
            setCurrentLetterIndex(0);
            setShowWord(true); // 顯示新單字
            setFeedback(null);
            canvasRef.current.clearCanvas();
          }, 1000);
        }
      } else {
        // 切換到下一個字母
        setTimeout(() => {
          setCurrentLetterIndex(prev => prev + 1);
          setFeedback(null);
          canvasRef.current.clearCanvas();
        }, 1000);
      }
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
        canvasRef.current.clearCanvas();
      }, 1000);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setShowWord(true);
    setFeedback(null);
    setCorrectCount(0);
    setGameCompleted(false);
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  if (gameCompleted) {
    return (
      <div className="game-stats">
        <h2>遊戲完成!</h2>
        <p>您寫對了 {correctCount} 個字母</p> {/* 顯示正確的單字數量 */}
        <button onClick={resetGame}>再玩一次</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>字母書寫遊戲</h1>
      
      <div className="word-display">
        {showWord ? (
          <h2>{currentWord}</h2> 
        ) : (
          <p>請寫出字母: </p> /* 顯示當前字母 */
         // <p>請寫出字母: <span className="letter-prompt">{currentLetter}</span> </p> /* 顯示當前字母 */
        )}
      </div>
      
      <div className="canvas-container">
        <ReactSketchCanvas
          ref={canvasRef}
          width="300px"
          height="300px"
          strokeWidth={4}
          strokeColor="black"
          canvasColor="white"
        />
      </div>
      
      <div className="controls">
        <button onClick={checkLetter} disabled={feedback !== null}>確認</button>
        <button onClick={() => canvasRef.current.clearCanvas()}>清除</button>
      </div>
      
      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? '✅ 正確!' : '❌ 不正確，請再試一次'}
        </div>
      )}
    </div>
  );
}

export default gameen;
