import { useState, useRef, useEffect } from 'react';
import './css/writingch.css';
import axios from 'axios';

import gif1 from '../assets/hua_stroke.gif';
import gif2 from '../assets/shi_stroke.gif';
import gif3 from '../assets/ni_stroke.gif';
import gif4 from '../assets/tu_stroke.gif';
import gif5 from '../assets/wang_stroke.gif';
const API_URL = "https://my-react-game-server-0uk9.onrender.com";

const gifList = [gif1, gif2, gif3, gif4, gif5];
const WORDS = ['花', '石', '你', '土', '王'];
export default function WritingCh() {
  
  const [message, setMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const [infoStatus, setinfoStatus] = useState(null);
  const [AIresult, setAIresult] = useState(null);
  const [letter_YorN, setYorN] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(WORDS[0]);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const ctxRef = useRef(null);

  useEffect(() => {
    setCurrentLetter(WORDS[currentIndex]);
  }, [currentIndex]);
  useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.lineCap = 'round';
      ctxRef.current = ctx;

    const startDrawing = (e) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      isDrawing.current = true;
      ctx.beginPath();
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
      const ctx = ctxRef.current;
      if (!isDrawing.current || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      isDrawing.current = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []);

  const handleCheck = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL('image/png');
    const hasDrawing = data && !data.includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
    setMessage(hasDrawing ? '通過 ✅' : '再試一次 ❌');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setYorN(null); // 清除 Y/N 狀態
    setAIresult(null); // 清除 AI 回饋  
    setinfoStatus(null); // 清除 AI 回饋
  };

  const handleDownload = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `writing-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= gifList.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      
      handleClear();
    }
  };


  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    handleClear();
  };

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
        handleClear();
      }, 1000);
    }
  };
  
  const handleSubmitToServer = async () => {
    if (!canvasRef.current) return;

    try {
      setinfoStatus("loading");
      const imageData = canvasRef.current.toDataURL('image/png');;
      //const res = await axios.post("https://my-react-game-ai.onrender.com/api/recognize", {
      const res = await axios.post("http://127.0.0.1:5000/api/recognize", {
        
        image: imageData,
        ans: currentLetter,
      });

      const result = res.data;
      setinfoStatus("ai_replied");
      setAIresult(result);
      return result.letter;
    } catch (error) {
      console.error("AI error:", error?.response?.data || error.message);
      alert("AI 辨識過程中出錯，請稍後再試");
      setAIresult(null);
      setinfoStatus(null);
      return null;
    }
  };

  const clear = () => {
    if (canvasRef.current) {  // 確保 canvasRef.current 存在
        handleClear() // 清除畫布    
        setYorN(null); // 清除 Y/N 狀態
        setAIresult(null); // 清除 AI 回饋  
        setinfoStatus(null); // 清除 AI 回饋
    }  
 
  }


//html處
  if (isFinished) {
    return (
      <div className="writing-container">
        <h2 className="finish-text">🎉 恭喜你完成所有練習！</h2>
        <button onClick={handleRestart} className="control-button">重新練習</button>
      </div>
    );
  }

  return (
    <div className="writing-container">
      <h2 className="title">第 {currentIndex + 1} / {gifList.length} 題</h2>

      <div className="canvas-wrapper">
        <div className="canvas-layer">
          <img src={gifList[currentIndex]} alt="筆順題目" className="stroke-gif" />
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="sketch-canvas"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'transparent',
              touchAction: 'none',
            }}
          />
        </div>
      </div>

      {message && <div className="feedback-message">{message}</div>}

      <div className="controls">
        <button onClick={checkLetter}>送出辨識</button>
        <button onClick={clear}>菜就重練</button>
        <button onClick={handleNext}>下一個</button>
        <button onClick={handleDownload}>下載</button>
        
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
            {infoStatus === 'ai_replied' && '麻雀老師要講話！雀寶寶請注意！'}
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