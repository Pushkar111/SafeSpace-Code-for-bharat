import json
import requests

# OpenRouter
OPENROUTER_API_KEY = "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"
OPENROUTER_MODEL = "mistralai/mistral-7b-instruct:free"

def generate_safety_advice(title, description=""):
    prompt = f"""
You are a safety advisor AI. Given the following news headline and description, give practical safety advice to the public. Keep your answer short, actionable, and in bullet points (max 3). Don't mention the news source.

News Headline: {title}
Description: {description}

Safety Advice:
"""

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, data=json.dumps(data))
        result = response.json()
        if "choices" in result and result["choices"]:
            reply = result["choices"][0]["message"]["content"].strip()
            # print("OpenRouter Response:", result)
            return reply
        else:
            # print("Unexpected response format:", result)
            return "No advice available."

    except Exception as e:
        print("Error during safety advice generation:", e)
        return "No advice available."
