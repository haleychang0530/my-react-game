#接收圖片並傳給 Gemini
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import io
from PIL import Image
from datetime import datetime
import logging
import json
import re

app = Flask(__name__)
# 設定
CORS(app, resources={r"/api/*": {"origins": [
                                  "http://localhost:5173",
                                  "http://localhost:5174",
                                  "http://localhost:5175"
                                 ]}})
logging.basicConfig(level=logging.INFO,
                     format="%(asctime)s - %(levelname)s - %(message)s"
                     )
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# 你可以替換成你自己的 Gemini 模組
from gemini_utils import get_gemini_response_from_image

@app.route("/api/recognize", methods=["POST"])
def recognize():
    
    data = request.get_json()
    image_b64 = data.get("image")
    ans = data.get("ans")
    logging.info("已拿到圖片\nans = %s\n", ans)
    if not image_b64:
        logging.info("沒有圖片info")
        logging.error("沒有圖片error")
        response = jsonify({"error": "No image"})
        response.status_code = 400
        return response

    # 解 base64，轉成圖片
    image_data = base64.b64decode(image_b64.split(",")[1])
    image = Image.open(io.BytesIO(image_data))

    # 儲存圖片
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    file_path = os.path.join(UPLOAD_DIR, f"letter-{timestamp}.png")
    image.save(file_path)
    print(f"✅ 圖片儲存成功：{file_path}")

    # 傳給 Gemini（你自己寫的）
    response_str = get_gemini_response_from_image(ans, image)
    print("📦 這是 Gemini 回傳的 raw 字串：\n", response_str)
    match = re.search(r'\{.*\}', response_str, re.DOTALL)
    # 解析魔法：
    print("📦 解析魔法後！ \n", repr(response_str))

    if match:
        json_part = match.group(0)
        response_dict = json.loads(json_part)
        return jsonify(response_dict)
    else:
        print("❌ 無法解析為 JSON，收到的內容是：", response_str)
        return jsonify({"error": "AI 回傳格式錯誤，無法解析 JSON"}), 500

   


    

if __name__ == "__main__":
    app.run(debug=True)
