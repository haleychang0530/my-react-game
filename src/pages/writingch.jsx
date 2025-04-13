import { useState, useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import "./css/writingch.css";

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

  const handleCheck = async () => {
    const data = await canvasRef.current?.getDataURL();
    const hasDrawing = data && data !== 'data:,';
    setMessage(hasDrawing ? '通過 ✅' : '再試一次 ❌');
  };

  const handleClear = () => {
    canvasRef.current?.clear();
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
    setCurrentIndex((prev) => (prev - 1 + gifList.length) % gifList.length);
    handleClear();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    handleClear();
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-2xl font-bold text-green-600">🎉 恭喜你完成所有練習！</h2>
        <button onClick={handleRestart} className="px-4 py-2 bg-blue-500 text-white rounded">
          重新練習
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <h2 className="text-lg font-semibold mb-1">第 {currentIndex + 1} / {gifList.length} 題</h2>
      <div className="relative w-[300px] h-[300px] border border-gray-300 rounded-md overflow-hidden">
        {/* GIF 圖片 - 作為背景 */}
        <img
          src={gifList[currentIndex]}
          alt="筆順題目"
          className="absolute w-full h-full object-contain bg-white"
        />
        {/* Canvas 畫布 - 完全覆蓋在 GIF 上 */}
        <ReactSketchCanvas
          ref={canvasRef}
          width="100%"
          height="100%"
          strokeWidth={4}
          strokeColor="black"
          backgroundColor="transparent"
          className="absolute top-0 left-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />
        {/* 操作按鈕 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-white/80 z-20 p-2">
          <button onClick={handleCheck} className="px-2 py-1 bg-green-500 text-white rounded">
            判斷
          </button>
          <button onClick={handleClear} className="px-2 py-1 bg-gray-500 text-white rounded">
            清除
          </button>
        </div>
        {message && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow z-30 text-sm">
            {message}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={handlePrev} className="px-3 py-1 bg-blue-500 text-white rounded">上一題</button>
        <button onClick={handleNext} className="px-3 py-1 bg-blue-500 text-white rounded">下一題</button>
      </div>
    </div>
  );
}