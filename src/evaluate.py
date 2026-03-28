"""Evaluate fine-tuned model with classification metrics.

Usage:
    python src/evaluate.py
"""
import json
from sklearn.metrics import classification_report, accuracy_score
from src.predict import predict_intent

INTENTS = ['sales', 'support', 'billing', 'escalation', 'general']


def evaluate(test_path='data/test.json', model_dir='models/intent-classifier'):
    """Evaluate the fine-tuned model on the test set.

    Args:
        test_path: Path to the test data JSON file.
        model_dir: Path to the fine-tuned model directory.

    Returns:
        Dictionary with accuracy and per-class classification report.
    """
    with open(test_path, encoding='utf-8') as f:
        test_data = json.load(f)

    y_true = [d['label'] for d in test_data]
    y_pred = []

    for d in test_data:
        result = predict_intent(d['text'], model_dir)
        y_pred.append(INTENTS.index(result['intent']))

    accuracy = accuracy_score(y_true, y_pred)
    report = classification_report(
        y_true, y_pred,
        target_names=INTENTS,
        output_dict=True,
    )

    print(f"\nAccuracy: {accuracy:.2%}")
    print(classification_report(y_true, y_pred, target_names=INTENTS))

    return {'accuracy': accuracy, 'report': report}


if __name__ == '__main__':
    evaluate()
