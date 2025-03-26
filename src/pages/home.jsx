import { useState, useEffect } from "react";
import "./css/home.css";
import petImageLow from '../assets/react.svg'; 

export default function HomePage() {
  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);

  // 根據 record 顯示不同的寵物圖片
  const getPetImage = (record) => {
    if (record < 1000) {
      return petImageLow; 
    } else if (record < 5000) {
      return petImageLow;
    } else {
      return petImageLow;
    }
  };

  // 模擬 API 請求來抓取資料
  const fetchPetStatus = async () => {
    try {
      // 🚀 在這裡替換成真實的 API 請求，像是：
      // const res = await fetch("/api/pet-status");
      // const data = await res.json();

      // 🟡 現在使用假數據
      const fakeData = { hp: 80, score: 1200, record: 3500 };
      setHp(fakeData.hp);
      setScore(fakeData.score);
      setRecord(fakeData.record);
    } catch (error) {
      console.error("Error fetching pet status:", error);
    }
  };

  // 初始化時抓取寵物狀態
  useEffect(() => {
    fetchPetStatus();
  }, []);

  // 根據 record 決定顯示的寵物圖片
  const petImage = getPetImage(record);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <div className="bg-gray-900 text-white p-6 w-[320px] text-center pixel-border">
        <h2 className="text-xl pixel-font mb-4">Pet Status</h2>

        {/* 顯示 HP, Score, Record */}
        <div className="space-y-2">
          <p className="pixel-font text-yellow-300">HP: <span>{hp}</span></p>
          <p className="pixel-font text-blue-300">Score: <span>{score}</span></p>
          <p className="pixel-font text-green-300">Record: <span>{record}</span></p>
        </div>

        {/* 顯示寵物圖片 */}
        <img src={petImage} alt="Pet" className="mt-4 w-[200px] h-auto mx-auto" />
        
        {/* 更換服裝按鈕 */}
        <button onClick={() => alert("Change Outfit!")} className="pixel-button mt-4">
          Change Outfit
        </button>
      </div>
    </div>
  );
}
