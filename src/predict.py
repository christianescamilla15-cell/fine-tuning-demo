"""Run inference with the fine-tuned intent classification model.

Usage:
    python src/predict.py
"""
import json
import os
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

INTENTS = ['sales', 'support', 'billing', 'escalation', 'general']

_model = None
_tokenizer = None


def load_model(model_dir='models/intent-classifier'):
    """Load the fine-tuned model and tokenizer.

    Falls back to the base pretrained model if no fine-tuned model exists
    (demo/testing mode).
    """
    global _model, _tokenizer
    if _model is None:
        if os.path.exists(model_dir) and os.path.exists(
            os.path.join(model_dir, 'config.json')
        ):
            print(f"Loading fine-tuned model from {model_dir}")
            _tokenizer = DistilBertTokenizer.from_pretrained(model_dir)
            _model = DistilBertForSequenceClassification.from_pretrained(model_dir)
        else:
            # Demo mode: use base model (untrained, for testing pipeline)
            base = 'distilbert-base-multilingual-cased'
            print(f"No fine-tuned model found. Using base model: {base}")
            _tokenizer = DistilBertTokenizer.from_pretrained(base)
            _model = DistilBertForSequenceClassification.from_pretrained(
                base, num_labels=len(INTENTS)
            )
        _model.eval()
    return _model, _tokenizer


def predict_intent(text, model_dir='models/intent-classifier'):
    """Predict the intent of a given text.

    Args:
        text: Input text string (Spanish customer message).
        model_dir: Path to the fine-tuned model directory.

    Returns:
        Dictionary with text, predicted intent, confidence score,
        and all intent scores.
    """
    model, tokenizer = load_model(model_dir)
    inputs = tokenizer(
        text,
        return_tensors='pt',
        truncation=True,
        padding=True,
        max_length=64,
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)[0]
    idx = probs.argmax().item()

    return {
        'text': text,
        'intent': INTENTS[idx],
        'confidence': float(probs[idx]),
        'all_scores': {
            INTENTS[i]: round(float(probs[i]), 4)
            for i in range(len(INTENTS))
        },
    }


def reset_model():
    """Reset cached model (useful for testing)."""
    global _model, _tokenizer
    _model = None
    _tokenizer = None


if __name__ == '__main__':
    examples = [
        'quiero comprar algo',
        'mi pedido no llego',
        'necesito mi factura',
        'esto es inaceptable quiero hablar con un gerente',
        'hola que tal',
    ]
    for text in examples:
        result = predict_intent(text)
        print(f"  {result['text']}")
        print(f"  -> {result['intent']} ({result['confidence']:.1%})")
        print()
