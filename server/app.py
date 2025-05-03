#接收圖片並傳給 Gemini
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import io
from PIL import Image
from datetime import datetime
import logging

app = Flask(__name__)
# 設定
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
logging.basicConfig(level=logging.INFO,
                     format="%(asctime)s - %(levelname)s - %(message)s"
                     )
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 你可以替換成你自己的 Gemini 模組
from gemini_utils import get_gemini_response_from_image

@app.route("/api/recognize", methods=["POST"])
def recognize():
    logging.info("絕望的嗨")
    data = request.get_json()
    image_b64 = data.get("image")
    logging.info("用戶上傳了一張圖片")

    if not image_b64:
        logging.info("沒有圖片info")
        logging.error("沒有圖片error")
        return jsonify({"error": "No image provided"}), 400

    # 解 base64，轉成圖片
    image_data = base64.b64decode(image_b64.split(",")[1])
    image = Image.open(io.BytesIO(image_data))

    # 儲存圖片
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    file_path = os.path.join(UPLOAD_DIR, f"letter-{timestamp}.png")
    image.save(file_path)
    print(f"✅ 圖片儲存成功：{file_path}")

    # 傳給 Gemini（你自己寫的）
    recognized_letter = get_gemini_response_from_image(image)

    return jsonify({"letter": recognized_letter})


    

if __name__ == "__main__":
    app.run(debug=True)
