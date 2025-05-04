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
CORS(app)
logging.basicConfig(level=logging.INFO,
                     format="%(asctime)s - %(levelname)s - %(message)s"
                     )
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# 你可以替換成你自己的 Gemini 模組
from gemini_utils import get_gemini_response_from_image, get_gemini_response_mail

@app.route('/')
def ignore():
    return '', 204  # No Content

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
    image_data = base64.b64decode(image_b64)
    image = Image.open(io.BytesIO(image_data))

    # 儲存圖片
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    file_path = os.path.join(UPLOAD_DIR, f"letter-{timestamp}.png")
    image.save(file_path)
    print(f"✅ 圖片儲存成功：{file_path}")

    # 傳給 Gemini（你自己寫的）
    try:
        response_str = get_gemini_response_from_image(ans, image)
    except Exception as e:
        return jsonify({"error": f"Gemini 錯誤：{str(e)}"}), 500
    
    print("📦 這是 Gemini 回傳的 raw 字串：\n", response_str)
    return jsonify({"text": response_str})


@app.route("/api/recognize/ch", methods=["POST"])
def recognize_ch():
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
    try:
        response_str = get_gemini_response_from_image(ans, image)
    except Exception as e:
        return jsonify({"error": f"Gemini 錯誤：{str(e)}"}), 500
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



@app.route("/api/mail", methods=["POST"])
def recognize_mail():
    data = request.get_json(force=True)
    image_b64 = data.get("image")
    ans = data.get("ans")
    if not image_b64:
        logging.warning("⚠️ 沒有收到圖片")
        return jsonify({"error": "No image provided"}), 400

    try:
        image_data = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_data))

        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        file_path = os.path.join(UPLOAD_DIR, f"letter-{timestamp}.png")
        image.save(file_path)
        logging.info(f"✅ 圖片儲存成功：{file_path}")
        try:
            response_str = get_gemini_response_mail(ans, image)
            return jsonify({"text": response_str})
        except Exception as e:
            logging.error("❌ Gemini 錯誤：%s", str(e))
            return jsonify({"error": f"Gemini 錯誤：{str(e)}"}), 500
    except Exception as e:
        logging.error("❌ 總體處理失敗: %s", str(e))
        return jsonify({"error": "Server internal error"}), 500
        



if (__name__ == "__main__"):
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0",port=port)
