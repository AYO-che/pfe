from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict
import os
import tempfile
import gc
import torch

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    tmp.write(file.read())
    tmp.close()

    try:
        result = predict(tmp.name)
    finally:
        try:
            os.unlink(tmp.name)
        except:
            pass
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)