import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import warnings
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
import pandas as pd
import joblib
import torch
import numpy as np
import onnxruntime as ort
from server.routes.api import fetch_news
from server.utils.solution import generate_safety_advice
from transformers import AutoTokenizer

# Load NB-SVM model (sklearn-based)
nbsvm_model = joblib.load("backend/models/threat.pkl")

# Load tokenizer for ONNX model
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Load ONNX model
onnx_session = ort.InferenceSession("backend/models/model.onnx")

print("\n📰 FETCHING NEWS...\n")
articles = fetch_news("Delhi")  # You can change the city name here
if not articles:
    print("❌ No articles found.")
    exit()

df = pd.DataFrame(articles[:10])  # Limit to 10 news articles
df["text"] = df["title"].fillna("") + ". " + df["description"].fillna("") + ". " + df["content"].fillna("")

print("🛡️ Running NB-SVM Threat Classifier...\n")
predictions = nbsvm_model.predict(df["text"])
df["nbsvm_pred"] = predictions
df["nbsvm_label"] = ["Threat" if pred == 1 else "Safe" for pred in predictions]

confirmed_threats = []

for idx, row in df.iterrows():
    if row["nbsvm_pred"] == 1:
        text = row["text"]

        # Tokenize the input
        inputs = tokenizer(text, return_tensors="np", padding=True, truncation=True, max_length=128)

        # Remove unsupported keys like token_type_ids
        if "token_type_ids" in inputs:
            del inputs["token_type_ids"]

        # Get ONNX output name dynamically
        output_name = onnx_session.get_outputs()[0].name

        # Run inference
        # Ensure input values are in correct type (int64)
        input_feed = {
            key: value.astype(np.int64)
            for key, value in inputs.items()
            if key in [i.name for i in onnx_session.get_inputs()]
        }
        logits = onnx_session.run([output_name], input_feed)[0]

        probs = torch.softmax(torch.tensor(logits), dim=1).numpy().flatten()
        confidence = probs[1]  # Class 1 = threat

        if confidence > 0.6:
            advice = generate_safety_advice(row["title"], row["description"])
            confirmed_threats.append({
                "title": row["title"],
                "url": row["url"],
                "confidence": round(float(confidence), 2),
                "advice": advice
            })


print("\n🚨 CONFIRMED THREATS\n")
if not confirmed_threats:
    print("✅ No confirmed threats found by ONNX model.")
else:
    for i, threat in enumerate(confirmed_threats, 1):
        print(f"{i}. {threat['title']}")
        print(f"   🔗 {threat['url']}")
        print(f"   ✅ Confidence: {threat['confidence'] * 100:.2f}%")
        print(f"   🧠 Advice: {threat['advice']}\n")

Code