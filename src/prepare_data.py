"""Prepare intent classification dataset for fine-tuning."""
import csv
import json
import os
from sklearn.model_selection import train_test_split

INTENTS = ['sales', 'support', 'billing', 'escalation', 'general']


def load_data(csv_path='data/intents.csv'):
    """Load intent data from CSV file."""
    texts, labels = [], []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row['text'].strip())
            labels.append(INTENTS.index(row['intent'].strip()))
    return texts, labels


def split_data(texts, labels, test_size=0.2):
    """Split data into train/test sets with stratification."""
    return train_test_split(
        texts, labels,
        test_size=test_size,
        random_state=42,
        stratify=labels
    )


def save_splits(train_texts, test_texts, train_labels, test_labels, output_dir='data'):
    """Save train/test splits as JSON files."""
    os.makedirs(output_dir, exist_ok=True)
    for name, texts, labels in [
        ('train', train_texts, train_labels),
        ('test', test_texts, test_labels)
    ]:
        path = os.path.join(output_dir, f'{name}.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(
                [{'text': t, 'label': l} for t, l in zip(texts, labels)],
                f, indent=2, ensure_ascii=False
            )
    print(f"Train: {len(train_texts)}, Test: {len(test_texts)}")


if __name__ == '__main__':
    texts, labels = load_data()
    train_t, test_t, train_l, test_l = split_data(texts, labels)
    save_splits(train_t, test_t, train_l, test_l)
