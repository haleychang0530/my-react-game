// src/pages/MailPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './css/MailPage.css'; // 假設你有一個 CSS 檔案來處理樣式

const MailPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResponseText("");
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("請先上傳一張圖片！");
      return;
    }
  
    const ans = prompt("請輸入信件內容：", "這是預設內容");
    if (!ans) return;
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // 移除 data:image/png;base64,...
  
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:5000/api/mail", {
          image: base64Image,
          ans: ans,
        });
  
        setResponseText(res.data.text || "（無回覆內容）");
      } catch (err) {
        console.error("❌ 錯誤:", err);
        setResponseText("發生錯誤，請稍後再試");
      } finally {
        setLoading(false);
      }
    };
  
    reader.readAsDataURL(imageFile);
  };
  
  
  return (
    <div className="mail-container">
      <h2 className="mail-title">寄送一封手寫信 💌</h2>
      <p className="mail-instruction">【郵箱】寄信給麻雀老師：</p>
  
      <input type="file" accept="image/*" onChange={handleImageChange} className="mail-file-input" />
      
      {previewUrl && (
        <div className="mail-preview-wrapper">
          <img src={previewUrl} alt="預覽圖" className="mail-preview-image" />
        </div>
      )}
  
      <button onClick={handleSubmit} className="mail-submit-button" disabled={loading}>
        {loading ? "分析中..." : "送出並請 AI 回覆"}
      </button>
  
      {responseText && (
        <div className="mail-response">
          <h4>AI 回覆內容：</h4>
          <p>{responseText}</p>
        </div>
      )}
    </div>
  );
};

export default MailPage;
