from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch
import time
import os
import psutil
from codecarbon import EmissionsTracker

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Global variables to store the models
standard_summarizer = None
optimized_summarizer = None
optimized_tokenizer = None

# Model paths
STANDARD_MODEL = "EleutherAI/pythia-70m-deduped"
OPTIMIZED_MODEL_PATH = os.environ.get(
    "OPTIMIZED_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "../../ai-models/finetuned-pythia-70m-cnn")
)

def load_standard_model():
    """Load the standard EleutherAI model for summarization"""
    global standard_summarizer
    if standard_summarizer is None:
        device = 0 if torch.cuda.is_available() else -1
        print(f"Loading standard model: {STANDARD_MODEL}")
        standard_summarizer = pipeline(
            "text-generation",
            model=STANDARD_MODEL,
            device=device
        )
        print("Standard model loaded successfully!")
    return standard_summarizer

def load_optimized_model():
    """Load the fine-tuned local model for optimized summarization"""
    global optimized_summarizer, optimized_tokenizer
    if optimized_summarizer is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading optimized model from: {OPTIMIZED_MODEL_PATH}")

        # Load base model
        base_model = AutoModelForCausalLM.from_pretrained(
            STANDARD_MODEL,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None
        )

        # Load fine-tuned adapter
        optimized_summarizer = PeftModel.from_pretrained(
            base_model,
            OPTIMIZED_MODEL_PATH
        )

        # Load tokenizer
        optimized_tokenizer = AutoTokenizer.from_pretrained(OPTIMIZED_MODEL_PATH)

        print("Optimized model loaded successfully!")
    return optimized_summarizer, optimized_tokenizer

def generate_summary(text, model_type="standard"):
    """Generate summary with emission, time, and memory tracking"""
    # Get process for memory tracking
    process = psutil.Process()

    # Get initial memory usage (in MB)
    initial_memory = process.memory_info().rss / (1024 * 1024)

    # Initialize tracker
    tracker = EmissionsTracker(save_to_file=False, log_level="error")
    tracker.start()

    # Start time tracking
    start_time = time.time()

    try:
        if model_type == "optimized":
            model, tokenizer = load_optimized_model()

            # Prepare input
            prompt = f"Summarize the following text in 10-15 words:\n{text}\n\nSummary:"
            inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)

            if torch.cuda.is_available():
                inputs = {k: v.to("cuda") for k, v in inputs.items()}

            # Generate summary
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=20,
                    min_new_tokens=8,
                    do_sample=False,
                    pad_token_id=tokenizer.eos_token_id
                )

            summary_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Extract only the summary part after "Summary:"
            if "Summary:" in summary_text:
                summary_text = summary_text.split("Summary:")[-1].strip()
        else:
            model = load_standard_model()

            # Generate summary
            prompt = f"Summarize the following text in 10-15 words:\n{text}\n\nSummary:"
            result = model(
                prompt,
                max_new_tokens=20,
                min_new_tokens=8,
                do_sample=False
            )

            summary_text = result[0]['generated_text']
            # Extract only the summary part after "Summary:"
            if "Summary:" in summary_text:
                summary_text = summary_text.split("Summary:")[-1].strip()

        # Stop tracking
        execution_time = time.time() - start_time
        emissions = tracker.stop()

        # Get final memory usage and calculate difference (in MB)
        final_memory = process.memory_info().rss / (1024 * 1024)
        memory_used = final_memory - initial_memory

        # Convert emissions from kg to Wh (Watt-hours)
        # Assuming average energy intensity of 0.5 kWh/kg CO2
        energy_wh = (emissions * 0.5 * 1000) if emissions else 0

        # Convert execution time from seconds to milliseconds
        latency_ms = execution_time * 1000

        return {
            "summary": summary_text[:100],  # Limit length
            "energy": round(energy_wh, 5),  # Wh
            "latency": round(latency_ms, 2),  # ms
            "memory": round(max(memory_used, 0), 2)  # MB (ensure non-negative)
        }

    except Exception as e:
        tracker.stop()
        raise e

@app.route('/summarize', methods=['POST'])
def summarize():
    """
    Endpoint to receive text and return a summary using standard or optimized model
    Expected JSON: {"text": "your text here", "optimized": false}
    Returns: {"summary": "text", "energy": 0.00092, "latency": 1.0, "memory": 420.0}
    """
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        optimized = data.get('optimized', False)

        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400

        # Generate summary with tracking
        model_type = "optimized" if optimized else "standard"
        result = generate_summary(text, model_type)

        return jsonify(result), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Optionally preload the models on startup
    print("Starting Flask API on port 5000...")
    print("Models will be loaded on first request")
    app.run(host='0.0.0.0', port=5000, debug=True)
