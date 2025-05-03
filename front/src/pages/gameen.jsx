import React, { useState, useRef, useEffect } from 'react';
import './css/gameen.css';
import axios from 'axios';

const WORDS = ['dog', 'c'];
const API_URL = "https://my-react-game-server-0uk9.onrender.com";

function Gameen() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [infoStatus, setinfoStatus] = useState(null);
  const [AIresult, setAIresult] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [letter_YorN, setYorN] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const ctxRef = useRef(null);

  const currentWord = WORDS[currentWordIndex];
  const currentLetter = currentWord[currentLetterIndex];

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

  const checkLetter = async () => {
    if (!canvasRef.current) return;
    const res = await handleSubmitToServer();
    if (res === currentLetter.toLowerCase()) {
      setYorN('Y');
      setCorrectCount(prev => prev + 1);
    } else {
      setYorN('N');
      setTimeout(() => {
        setinfoStatus(null);
        clearCanvas();
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameCompleted) {
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

  const resetGame = () => {
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setinfoStatus(null);
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

  //安 handleSubmitToServer
  // 這個函數會將畫布上的圖像傳送到伺服器進行辨識
  const handleSubmitToServer = async () => {
    if (!canvasRef.current) return;
  
    /*
    // 1️⃣ 檢查是否有畫任何筆劃（避免 "No stroke found!"）
    const paths = await canvasRef.current.exportPaths();
    if (paths.length === 0) {
      alert("⚠️ 請先寫一個字再送出！");
      return;
    }
  */
    try {
      setinfoStatus("loading");
      const imageData = getCanvasDataURL();
      const res = await axios.post("https://my-react-game-ai.onrender.com/api/recognize", {
        image: imageData,
        ans: currentLetter,
      });

      const result = res.data;
      setinfoStatus("ai_replied");
      setAIresult(result);
      return result.letter;
    } catch (error) {
      console.error("AI error:", error);
      alert("AI 辨識過程中出錯，請稍後再試");
      setAIresult(null);
      setinfoStatus(null);
      return null;
    }
  };

  const clear = () => {
    if (canvasRef.current) {  // 確保 canvasRef.current 存在
        clearCanvas() // 清除畫布    
        setYorN(null); // 清除 Y/N 狀態
        setAIresult(null); // 清除 AI 回饋  
        setinfoStatus(null); // 清除 AI 回饋
    }  
 
  }
  //安 clear函數 end
  
  //安 next函數
  const next = () => {
    if (currentLetterIndex === currentWord.length - 1) {
      if (currentWordIndex === WORDS.length - 1) {
        setGameCompleted(true);
      } else {
        setCurrentWordIndex(prev => prev + 1);
        setCurrentLetterIndex(0);
      }
    } else {
      setCurrentLetterIndex(prev => prev + 1);
    }
    setinfoStatus(null);
    setYorN(null);
    setAIresult(null);
    clearCanvas();
    
  };

  //安 clear函數 end
  if (gameCompleted) {
    return (
      <div className="game-stats">
        <h2><strong>遊戲完成!</strong></h2>
        <div>您寫對了 {correctCount} 個字母</div>
        <button onClick={resetGame}>再玩一次</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>字母書寫遊戲</h1>
      <div className="word-display">
        <h2>{currentWord}</h2>
        <div>請寫出字母: <span className="letter-prompt">{currentLetter}</span></div>
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
        <button onClick={checkLetter}>送出辨識</button>
        <button onClick={clear}>菜就重練</button>
        <button onClick={next}>下一個</button>
      </div>

      <div className="description">
        {letter_YorN &&(
          <div className={`letter_YorN ${letter_YorN}`}>
          {letter_YorN === 'Y' && '✅ 正確!'}
          {letter_YorN === 'N' && '❌ 不正確，請再試一次'}
          </div>
        )}

        {infoStatus && (
          <div className={`infoStatus ${infoStatus}`}>
            {infoStatus === 'loading' && '⏳ AI 辨識中...'}
            {infoStatus === 'ai_replied' && '麻雀老師要講話了！雀寶寶請注意！'}
          </div>
        )}

        {AIresult && (
          <div className="ai-result">
            <p><strong>🔤 麻雀老師覺得你寫的字是：</strong></p>
            <div className="big-letter">"{AIresult.letter}"</div>
            <p><strong>📝 評語：</strong></p>
            <div dangerouslySetInnerHTML={{ __html: AIresult.feedback.replace(/\n/g, '<br/>') }} />
            <p><strong>📊 雀寶寶的分數：</strong> {AIresult.score} 分</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gameen
