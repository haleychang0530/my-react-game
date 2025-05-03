import { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const startDrawing = (e) => {
      isDrawing.current = true;
      ctx.beginPath();
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
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
  }, [currentIndex]);

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
    setMessage('');
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      handleClear();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    handleClear();
  };

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