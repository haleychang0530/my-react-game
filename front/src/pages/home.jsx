import { useState, useEffect } from "react";
import "./css/home.css";
import axios from 'axios';
import petImage_Initial from '../assets/chick_status/initial/initial_egg.png';
import petImage_Low from '../assets/chick_status/grown/chick.png';
import petImage_Initial_HpLow from '../assets/chick_status/edible/fried_egg.png';
import petImage_Low_HpLow from '../assets/chick_status/edible/roasted_chicken.png';
import petImage_High from '../assets/chick_status/grown/chick.png';

export default function HomePage() {
  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);

  // 根據 record 顯示不同的寵物圖片
   const getPetImage = (score, hp) => {
    if (score == 0 && hp < 80) {
      return petImage_Initial; 
    } 
    else if (score < 30 && hp >= 80) {
      return petImage_Initial;
    } 
    else if (score < 50 && hp >= 80) {
      return petImage_HIGH;
    }
    else if (score < 70 && hp >= 80) {
      return petImage_Low_HpLow;
    } 
    else {
      return petImage_High;
    }
  };

  const fetchPetStatus = async () => {
    try {
      const username = localStorage.getItem("username");
      const res = await axios.get(`https://my-react-game-server-0uk9.onrender.com/pet-status`, {params: {username}});
      console.log("Fetched data:", res.data, "Username:", username);
      setHp(res.data.hp);
      setScore(res.data.score);
      setRecord(res.data.score);

    } catch (error) {
      console.error("Error fetching pet status:", error);
    }
  };

  // 初始化時抓寵物狀態
  useEffect(() => {
    fetchPetStatus();
  }, []);

  // 根據 record 決定顯示的寵物圖片
  const petImage = getPetImage(score, hp);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <div className="bg-gray-900 text-white p-6 w-[320px] text-center pixel-border">
        <h2 className="text-xl pixel-font mb-4">Pet Status</h2>

        {/* 顯示 HP, Score, Record */}
        <div className="space-y-2">
          <p className="pixel-font text-yellow-300">HP: <span>{hp}</span></p>
          <p className="pixel-font text-blue-300">Score: <span>{score}</span></p>
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