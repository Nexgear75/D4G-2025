# Document Summarization with Pythia-70M

Fine-tuning and testing EleutherAI/pythia-70m-deduped on the CNN/DailyMail news summarization dataset.

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

## Training

To fine-tune the model:

```bash
python train.py
```

This will:
- Download the Pythia-70M model and CNN/DailyMail dataset
- Fine-tune using LoRA (parameter-efficient training)
- Save the model to `./finetuned-pythia-70m-cnn`
- Train for 3 epochs with evaluation every 200 steps

## Testing

### Test on dataset samples:

```bash
python test.py --mode dataset --num-samples 5
```

### Test with custom input:

```bash
python test.py --mode custom
```

Then enter your document/article (multi-line supported, end with empty line).

### Test both:

```bash
python test.py --mode both
```

### Options:

- `--mode`: Choose 'dataset', 'custom', or 'both' (default: both)
- `--num-samples`: Number of test samples to evaluate (default: 5)
- `--model-path`: Path to fine-tuned model (default: ./finetuned-pythia-70m-cnn)

## Model Details

- **Base Model**: EleutherAI/pythia-70m-deduped (70M parameters)
- **Dataset**: cnn_dailymail v3.0.0 (news article summarization)
- **Training Method**: LoRA (Low-Rank Adaptation)
- **Max Sequence Length**: 512 tokens
- **Prompt Format**:
  ```
  ### Document:
  [article text]

  ### Summary:
  [highlights/summary]
  ```
