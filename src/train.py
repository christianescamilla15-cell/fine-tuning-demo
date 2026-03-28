"""Fine-tune DistilBERT for intent classification.

Uses HuggingFace Transformers + PyTorch.
In demo mode (no GPU), trains for 1 epoch on CPU with small batch.

Usage:
    python src/train.py
"""
import json
import os
import torch
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from torch.utils.data import Dataset

INTENTS = ['sales', 'support', 'billing', 'escalation', 'general']
MODEL_NAME = 'distilbert-base-multilingual-cased'  # Supports Spanish


class IntentDataset(Dataset):
    """PyTorch Dataset for intent classification."""

    def __init__(self, data, tokenizer, max_length=64):
        self.encodings = tokenizer(
            [d['text'] for d in data],
            truncation=True,
            padding=True,
            max_length=max_length,
            return_tensors='pt',
        )
        self.labels = torch.tensor([d['label'] for d in data])

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: v[idx] for k, v in self.encodings.items()}
        item['labels'] = self.labels[idx]
        return item


def train(epochs=3, batch_size=8, output_dir='models/intent-classifier'):
    """Fine-tune DistilBERT on intent classification data.

    Args:
        epochs: Number of training epochs.
        batch_size: Batch size for training and evaluation.
        output_dir: Directory to save the fine-tuned model.

    Returns:
        HuggingFace Trainer instance with training results.
    """
    print(f"Loading {MODEL_NAME}...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=len(INTENTS)
    )

    with open('data/train.json', encoding='utf-8') as f:
        train_data = json.load(f)
    with open('data/test.json', encoding='utf-8') as f:
        test_data = json.load(f)

    train_ds = IntentDataset(train_data, tokenizer)
    test_ds = IntentDataset(test_data, tokenizer)

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Training on: {device}")

    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        eval_strategy='epoch',
        save_strategy='epoch',
        logging_steps=10,
        load_best_model_at_end=True,
        metric_for_best_model='eval_loss',
        no_cuda=not torch.cuda.is_available(),
        report_to='none',  # Disable wandb/tensorboard for demo
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
    )
    trainer.train()

    # Save model and tokenizer
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # Save label mapping
    label_map = {str(i): label for i, label in enumerate(INTENTS)}
    with open(os.path.join(output_dir, 'label_map.json'), 'w') as f:
        json.dump(label_map, f, indent=2)

    print(f"Model saved to {output_dir}")
    return trainer


if __name__ == '__main__':
    train(epochs=1)  # 1 epoch for demo/CPU
