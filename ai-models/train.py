import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, TaskType

MODEL_NAME = "EleutherAI/pythia-70m-deduped"
DATASET_NAME = "cnn_dailymail"
DATASET_CONFIG = "3.0.0"
OUTPUT_DIR = "./finetuned-pythia-70m-cnn"
MAX_LENGTH = 512

def format_prompt(document: str, summary: str = None) -> str:
    if summary:
        return f"### Document:\n{document}\n\n### Summary:\n{summary}"
    else:
        return f"### Document:\n{document}\n\n### Summary:\n"

def preprocess_function(examples, tokenizer):
    texts = [format_prompt(article, highlights) for article, highlights in zip(examples["article"], examples["highlights"])]
    model_inputs = tokenizer(texts, max_length=MAX_LENGTH, truncation=True, padding="max_length")

    labels = []
    for i, text in enumerate(texts):
        input_ids = model_inputs["input_ids"][i]
        document_marker = tokenizer("### Summary:", add_special_tokens=False).input_ids
        summary_start = input_ids.index(document_marker[0]) if document_marker[0] in input_ids else 0
        label = [-100] * summary_start + input_ids[summary_start:]
        labels.append(label)

    model_inputs["labels"] = labels
    return model_inputs


def main():
    print("Loading dataset...")
    dataset = load_dataset(DATASET_NAME, DATASET_CONFIG)

    print(f"Dataset info:")
    print(f"  Train samples: {len(dataset['train'])}")
    print(f"  Test samples: {len(dataset['test'])}")
    print(f"  Validation samples: {len(dataset['validation'])}")

    print(f"\nLoading model and tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
    )
    model.gradient_checkpointing_enable()

    print("\nConfiguring LoRA for parameter-efficient finetuning...")
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=16,
        lora_alpha=64,
        lora_dropout=0.1,
        target_modules=["query_key_value", "dense", "dense_h_to_4h", "dense_4h_to_h"],
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    print("\nPreprocessing datasets...")
    dataset["train"] = dataset["train"].select(range(30000))
    tokenized_train = dataset["train"].map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=dataset["train"].column_names,
        desc="Tokenizing train dataset"
    )

    tokenized_val = dataset["validation"].map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=dataset["validation"].column_names,
        desc="Tokenizing validation dataset"
    )

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=2,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=1e-3,
        warmup_steps=100,
        logging_steps=50,
        eval_strategy="steps",
        eval_steps=200,
        save_steps=200,
        save_total_limit=2,
        fp16=torch.cuda.is_available(),
        report_to="none",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
    )

    # %pip install torch %pip install transformers %pip install datasets %pip install peft %pip install accelerate %pip install sentencepiece %pip install protobuf

    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
        pad_to_multiple_of=None
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_val,
        data_collator=data_collator,
    )

    print("\nStarting training...")
    trainer.train()

    print(f"\nSaving final model to {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    print("\nTraining complete!")
    print(f"Model saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
