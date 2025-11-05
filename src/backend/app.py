from flask import Flask, request, jsonify
from transformers import pipeline
import torch

app = Flask(__name__)

# Global variable to store the model
summarizer = None

def load_model():
    """Load the AI model for summarization"""
    global summarizer
    if summarizer is None:
        # Using a local model - you can change the model name here
        model_name = "facebook/bart-large-cnn"  # Template name for now

        # Check if CUDA is available
        device = 0 if torch.cuda.is_available() else -1

        print(f"Loading model: {model_name}")
        summarizer = pipeline(
            "summarization",
            model=model_name,
            device=device
        )
        print("Model loaded successfully!")
    return summarizer

@app.route('/summarize', methods=['POST'])
def summarize():
    """
    Endpoint to receive text and return a summary
    Expected JSON: {"text": "your text here"}
    Returns: {"summary": "summarized text"}
    """
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']

        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400

        # Load model if not already loaded
        model = load_model()

        # Generate summary (10-15 words)
        summary = model(
            text,
            max_length=20,  # Maximum tokens (roughly 15 words)
            min_length=8,   # Minimum tokens (roughly 10 words)
            do_sample=False
        )

        summary_text = summary[0]['summary_text']

        return jsonify({
            "summary": summary_text,
            "original_length": len(text.split()),
            "summary_length": len(summary_text.split())
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Optionally preload the model on startup
    print("Starting Flask API...")
    load_model()
    app.run(host='0.0.0.0', port=5000, debug=True)
