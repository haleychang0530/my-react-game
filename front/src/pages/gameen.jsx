import React, { useState, useRef, useEffect } from 'react';
import './css/gameen.css';
import axios from 'axios';

const WORDS = ['dog', 'c']; // 預設單字列表
const API_URL = "https://my-react-game-server-0uk9.onrender.com";

function Gameen() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showWord, setShowWord] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const ctxRef = useRef(null);

  const currentWord = WORDS[currentWordIndex];
  const currentLetter = currentWord[currentLetterIndex];

  // 初始化 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.lineCap = 'round';
      ctxRef.current = ctx;
    }
  }, []);

  // 顯示單字後隱藏
  useEffect(() => {
    if (showWord) {
      const timer = setTimeout(() => setShowWord(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showWord]);

   useEffect(() => {
    const passScore = async () => {
      try {
        const username = localStorage.getItem("username");
        const res = await axios.post(`${API_URL}/updateScore`, {
          username,
          score: correctCount,
        });
        console.log(res.data);
      } catch (error) {
        console.error("Error uploading score:", error);
      }
    };

    if (gameCompleted) {
      passScore();
    }
  }, [gameCompleted]);

  const startDrawing = (x, y) => {
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing.current) return;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  const getCanvasDataURL = () => {
    return canvasRef.current.toDataURL('image/png');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const checkLetter = async () => {
    const recognizedLetter = prompt('請輸入您畫的字母:').toLowerCase();
    if (recognizedLetter === currentLetter.toLowerCase()) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);

      if (currentLetterIndex === currentWord.length - 1) {
        if (currentWordIndex === WORDS.length - 1) {
          setGameCompleted(true);
        } else {
          setTimeout(() => {
            setCurrentWordIndex(prev => prev + 1);
            setCurrentLetterIndex(0);
            setShowWord(true);
            setFeedback(null);
            clearCanvas();
          }, 1000);
        }
      } else {
        setTimeout(() => {
          setCurrentLetterIndex(prev => prev + 1);
          setFeedback(null);
          clearCanvas();
        }, 1000);
      }
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
        clearCanvas();
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
    clearCanvas();
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchStart = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  if (gameCompleted) {
    return (
      <div className="game-stats">
        <h2>遊戲完成!</h2>
        <p>您寫對了 {correctCount} 個字母</p>
        <button onClick={resetGame}>再玩一次</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>字母書寫遊戲</h1>
      <div className="word-display">
        {showWord ? <h2>{currentWord}</h2> : <p>請寫出字母: <span className="letter-prompt">{currentLetter}</span></p>}
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrawing}
          style={{ border: '1px solid #ccc', touchAction: 'none' }}
        />
      </div>

      <div className="controls">
        <button onClick={checkLetter} disabled={feedback !== null}>確認</button>
        <button onClick={clearCanvas}>清除</button>
      </div>

      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? '✅ 正確!' : '❌ 不正確，請再試一次'}
        </div>
      )}
    </div>
  );
}

export default Gameen;
