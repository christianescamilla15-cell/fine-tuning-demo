# Training Analysis — Intent Classification Fine-Tuning

## Model Configuration

| Parameter | Value |
|-----------|-------|
| Base model | `distilbert-base-multilingual-cased` |
| Task | Sequence classification (5 intents) |
| Max sequence length | 64 tokens |
| Training samples | 80 |
| Test samples | 20 |
| Batch size | 8 |
| Epochs (demo) | 1 |
| Epochs (full) | 3 |
| Optimizer | AdamW (default) |
| Learning rate | 5e-5 (default) |

## Intent Distribution

| Intent | Train | Test | Total |
|--------|-------|------|-------|
| sales | 16 | 4 | 20 |
| support | 16 | 4 | 20 |
| billing | 16 | 4 | 20 |
| escalation | 16 | 4 | 20 |
| general | 16 | 4 | 20 |
| **Total** | **80** | **20** | **100** |

## Expected Results

After 3 epochs of fine-tuning on this balanced dataset, the model should achieve:

- **Accuracy**: 85-95% on the test set
- **F1 (macro)**: 0.85-0.95
- Strong performance on distinct intents (sales vs general)
- Potential confusion between similar intents (support vs escalation)

## Training Pipeline

```
intents.csv --> prepare_data.py --> train.json + test.json
                                         |
                                    train.py (DistilBERT fine-tuning)
                                         |
                                    models/intent-classifier/
                                         |
                              evaluate.py (classification report)
                                         |
                              predict.py (inference on new text)
```

## Why DistilBERT?

1. **Multilingual support** — `distilbert-base-multilingual-cased` handles Spanish natively
2. **Efficient** — 40% smaller than BERT with 97% of performance
3. **Fast inference** — suitable for real-time intent classification
4. **Well-supported** — extensive HuggingFace ecosystem

## Scaling Considerations

For production deployment:
- Increase dataset to 500+ samples per intent
- Add data augmentation (back-translation, paraphrasing)
- Use learning rate scheduling with warmup
- Implement cross-validation for more robust evaluation
- Consider ONNX export for faster inference
- Add confidence thresholds for fallback routing
