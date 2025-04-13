import { useState, useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
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
  const canvasRef = useRef();

  const handleCheck = async () => {
    try {
      const data = await canvasRef.current.exportImage('png');
      const hasDrawing = data && data !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...';
      setMessage(hasDrawing ? '通過 ✅' : '再試一次 ❌');
    } catch (error) {
      console.error('Check error:', error);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setMessage('');
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
    <ReactSketchCanvas
  ref={canvasRef}
  width="100%"
  height="100%"
  strokeWidth={4}
  strokeColor="black"
  canvasColor="transparent"
  backgroundImage="none"
  exportWithBackgroundImage={false}
  preserveBackgroundImageAspectRatio="none"
  style={{
    backgroundColor: 'transparent',
    touchAction: 'none',
  }}
  className="sketch-canvas"
/>
  </div>

  {message && <div className="feedback-message">{message}</div>}
  <div className="button-group">
    <button onClick={handleCheck} className="button check">判斷</button>
    <button onClick={handleClear} className="button clear">清除</button>
  </div>
</div>

     
      <div className="nav-buttons">
        <button onClick={handlePrev} className="control-button">上一題</button>
        <button onClick={handleNext} className="control-button">下一題</button>
      </div>
    </div>
  );
}
