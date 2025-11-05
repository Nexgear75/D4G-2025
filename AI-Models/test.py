"""
Test the fine-tuned Pythia-70M model on dialogue summarization.
Supports both dataset samples and custom inputs.
"""

import argparse
import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

# Configuration
BASE_MODEL_NAME = "EleutherAI/pythia-70m-deduped"
FINETUNED_MODEL_PATH = "./finetuned-pythia-70m-cnn"
DATASET_NAME = "cnn_dailymail"
DATASET_CONFIG = "3.0.0"
MAX_LENGTH = 512
MAX_NEW_TOKENS = 20  # Limit to ~15 words (accounting for tokenization)

def format_prompt(document: str) -> str:
    """Format document into a prompt for inference."""
    return f"### Document:\n{document}\n\n### Summary:\n"

def generate_summary(model, tokenizer, document: str, device: str) -> str:
    """Generate a summary for the given document."""
    prompt = format_prompt(document)

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        max_length=MAX_LENGTH,
        truncation=True
    ).to(device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            num_return_sequences=1,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extract only the summary part (after "### Summary:")
    if "### Summary:" in generated_text:
        summary = generated_text.split("### Summary:")[-1].strip()
    else:
        summary = generated_text.strip()

    return summary

def test_dataset_samples(model, tokenizer, device: str, num_samples: int = 5):
    """Test the model on samples from the test dataset."""
    print(f"\n{'='*80}")
    print("Testing on dataset samples")
    print(f"{'='*80}\n")

    dataset = load_dataset(DATASET_NAME, DATASET_CONFIG)
    test_data = dataset["test"]

    # Get random samples
    import random
    indices = random.sample(range(len(test_data)), min(num_samples, len(test_data)))

    for i, idx in enumerate(indices, 1):
        sample = test_data[idx]
        document = sample["article"]
        ground_truth = sample["highlights"]

        print(f"Example {i}/{num_samples}")
        print(f"{'-'*80}")
        print(f"Document:\n{document}\n")

        generated_summary = generate_summary(model, tokenizer, document, device)

        print(f"Ground Truth Summary:\n{ground_truth}\n")
        print(f"Generated Summary:\n{generated_summary}\n")
        print(f"{'='*80}\n")

def test_custom_input(model, tokenizer, device: str):
    """Test the model on custom user input."""
    print(f"\n{'='*80}")
    print("Custom Input Mode")
    print(f"{'='*80}\n")
    print("Enter a document/article to summarize (type 'quit' to exit)")
    print("For multi-line input, end with an empty line\n")

    while True:
        print("Document:")
        lines = []
        while True:
            line = input()
            if line.lower() == 'quit':
                return
            if line == "" and lines:
                break
            if line:
                lines.append(line)

        if not lines:
            continue

        document = "\n".join(lines)

        print(f"\nGenerating summary...")
        generated_summary = generate_summary(model, tokenizer, document, device)

        print(f"\nGenerated Summary:\n{generated_summary}\n")
        print(f"{'='*80}\n")

def main():
    parser = argparse.ArgumentParser(description="Test fine-tuned Pythia-70M on document summarization")
    parser.add_argument(
        "--mode",
        type=str,
        choices=["dataset", "custom", "both"],
        default="both",
        help="Test mode: 'dataset' for test set samples, 'custom' for user input, 'both' for both"
    )
    parser.add_argument(
        "--num-samples",
        type=int,
        default=5,
        help="Number of dataset samples to test (default: 5)"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        default=FINETUNED_MODEL_PATH,
        help=f"Path to fine-tuned model (default: {FINETUNED_MODEL_PATH})"
    )

    args = parser.parse_args()

    # Set device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    # Load tokenizer
    print(f"\nLoading tokenizer from {args.model_path}...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_path)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Load model
    print(f"Loading fine-tuned model from {args.model_path}...")
    try:
        # Try loading as PEFT model first
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_NAME,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
        )
        model = PeftModel.from_pretrained(base_model, args.model_path)
        model = model.merge_and_unload()  # Merge LoRA weights
        print("Loaded as PEFT model (LoRA)")
    except:
        # Fall back to loading full model
        model = AutoModelForCausalLM.from_pretrained(
            args.model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
        )
        print("Loaded as full model")

    model.eval()

    # Run tests based on mode
    if args.mode in ["dataset", "both"]:
        test_dataset_samples(model, tokenizer, device, args.num_samples)

    if args.mode in ["custom", "both"]:
        test_custom_input(model, tokenizer, device)

if __name__ == "__main__":
    main()
