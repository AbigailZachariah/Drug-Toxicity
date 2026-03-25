from flask import Flask , request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# configuration

MODEL_PATH = r"C:\Users\H.P\Documents\codecure\model_pkl\rf_models.pkl"
TARGET_PATH = r"C:\Users\H.P\Documents\codecure\model_pkl\target_cols.pkl"

app = Flask(__name__)
CORS(app)

# Load the main ML model
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# Load target labels 
try:
    with open(TARGET_PATH, "rb") as f:
        target_labels = pickle.load(f)
except:
    target_labels = None


# API ENDPOINT

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    features = data["features"]
    input_array = np.array(features).reshape(1, -1)
    prediction = model.predict(input_array)[0]
    if hasattr(model, "predict_proba"):
        probability = float(np.max(model.predict_proba(input_array)))
    else:
        probability = None

    response = {
        "prediction": str(prediction),
        "probability": probability,
    }

    return jsonify(response)


# run server
if __name__ == "__main__":
    app.run(debug=True)