import React, { useState, useRef, useEffect } from 'react';
import './css/gameen.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
const WORDS = ['dog', 'c']; // 預設單字列表
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

  

  // 檢查用戶輸入的字母
  
  const checkLetter = async () => {
    if (!canvasRef.current) return;
    
    // 暫時使用prompt來模擬識別
    //const recognizedLetter = prompt('請輸入您畫的字母:').toLowerCase();
    const res = await handleSubmitToServer(); // 呼叫 AI 辨識函數
    console.log(`辨識結果res: ${JSON.stringify(res)}`);
    console.log("辨識字母",res); // 印出辨識結果的字母
    console.log("正確答案",currentLetter.toLowerCase()); 
    if (res === currentLetter.toLowerCase()) {
      console.log("Y");
      setYorN('Y'); // 設定為 Y
      setCorrectCount(prev => prev + 1);  }
    else {
      setYorN('N'); // 設定為 N
      setTimeout(() => {
        setinfoStatus(null);
        clearCanvas();
      }, 1000);
      }
    };
      
      
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


  const resetGame = () => {
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setShowWord(true);
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
      setinfoStatus("loading"); // 2️⃣ 顯示 Loading 狀態（你可以搭配動畫或文字）
  
      //const imageData = await canvasRef.current.exportImage("png");
      const imageData = getCanvasDataURL();
      
      console.log("🖼️ 收到畫布圖像");

      const res = await axios.post("http://localhost:5000/api/recognize", {
        image: imageData,
        ans: currentLetter, // 3️⃣ 傳送當前字母
      });

      console.log("等待 AI 回傳結果...");
  
      const result = await res.data; //在axios中，res.data就是我們要的結果
      console.log("✅ AI 辨識字母:", result.letter);
      console.log("✅ AI 回饋:", result.feedback);
      console.log("✅ 手寫分數:", result.score);
      setinfoStatus("ai_replied");  //注意! 可能要做一個重啟的步驟(例如當小朋友看完回應後要能按按鍵：下一個，然後setinfoStatus(null))
      setAIresult(result);
      return result.letter; // 返回辨識結果

    } catch (error) {
      console.error("❌ 發生錯誤:", error);
      alert("AI 辨識過程中出錯，請稍後再試");
      setAIresult(null); // 清除結果
      setinfoStatus(null);
      return null; // 返回 null
    }
  };
  
  //安 handleSubmitToServer end

  //安 clear函數
  const clear = () => {
    if (canvasRef.current) {  // 確保 canvasRef.current 存在
        clearCanvas() // 清除畫布    
        setYorN(null); // 清除 Y/N 狀態
        setAIresult(null); // 清除 AI 回饋  
        setinfoStatus(null); // 清除 AI 回饋
    }  
 
  }

  //安 clear函數 end
  
  //安 clear函數
  const next = () => {
    // 檢查是否完成當前單字
    if (currentLetterIndex === currentWord.length - 1) {
      // 檢查是否是最後一個單字
      if (currentWordIndex === WORDS.length - 1) {
        setGameCompleted(true);
      } else {
        // 切換到下一個單字
          setCurrentWordIndex(prev => prev + 1);
          setCurrentLetterIndex(0);
          setShowWord(true); // 顯示新單字
      }
    } else {
      // 切換到下一個字母
        setCurrentLetterIndex(prev => prev + 1);
        
    }
    setinfoStatus(null);
    setYorN(null); // 清除 Y/N 狀態
    setAIresult(null); // 清除 AI 回饋
    clearCanvas();
    
  }

  //安 clear函數 end
  if (gameCompleted) {
    return (
      <div className="game-stats">
        <h2><strong>遊戲完成!</strong></h2>
        <font size="5">您寫對了 {correctCount} 個字母</font> {/* 顯示正確的單字數量 */}
        <button onClick={resetGame}>再玩一次</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>字母書寫遊戲</h1>
      <div className="word-display">
          <h2>{currentWord}</h2>   
          <font size="5">請寫出字母: <span className="letter-prompt">{currentLetter}</span> </font> 
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
          <div className={`infoStatus ${infoStatus}`}>
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
              <ReactMarkdown>{AIresult.feedback}</ReactMarkdown>
              <p><strong>📊 雀寶寶的分數：</strong> {AIresult.score} 分</p>
            </div>
          )}
      </div>
    </div>
  );
}

export default Gameen;
