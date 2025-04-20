import { useState, useRef } from 'react';
import './css/writingch.css';

import gif1 from '../assets/hua_stroke.gif';
import gif2 from '../assets/shi_stroke.gif';
import gif3 from '../assets/ni_stroke.gif';
import gif4 from '../assets/tu_stroke.gif';
import gif5 from '../assets/wang_stroke.gif';

const gifList = [gif1, gif2, gif3, gif4, gif5];

export default function WritingCh() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const ctxRef = useRef(null);

  // 初始化 canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.lineCap = 'round';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctxRef.current = ctx;
    }
  };

  // 開始繪圖
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  // 繪圖
  const draw = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  // 停止繪圖
  const stopDrawing = () => {
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  // 處理觸控事件
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrawing(touch);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    draw(touch);
  };

  // 判斷是否有繪圖
  const handleCheck = async () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL('image/png');
    const hasDrawing = data && !data.includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
    setMessage(hasDrawing ? '通過 ✅' : '再試一次 ❌');
  };

  // 清除畫布
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMessage('');
  };

  // 下一題
  const handleNext = () => {
    if (currentIndex + 1 >= gifList.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      handleClear();
    }
  };

  // 上一題
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      handleClear();
    }
  };

  // 重新開始
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    handleClear();
  };

  // 下載圖片
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `writing-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 初始化畫布
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initCanvas();
  };

  // 設定 canvas 大小和初始化畫布
  useState(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrawing}
            style={{ border: '1px solid #ccc', touchAction: 'none', width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {message && <div className="feedback-message">{message}</div>}

      <div className="button-group">
        <button onClick={handleCheck} className="button check">判斷</button>
        <button onClick={handleClear} className="button clear">清除</button>
        <button onClick={handleDownload} className="button download">下載圖片</button>
      </div>

      <div className="nav-buttons">
        <button onClick={handlePrev} className="control-button">上一題</button>
        <button onClick={handleNext} className="control-button">下一題</button>
      </div>
    </div>
  );
}
