"""Tests for model training components."""
import pytest
import torch


class TestIntents:
    """Tests for intent configuration."""

    def test_intent_list_length(self):
        from src.train import INTENTS
        assert len(INTENTS) == 5

    def test_intent_names(self):
        from src.train import INTENTS
        expected = ['sales', 'support', 'billing', 'escalation', 'general']
        assert INTENTS == expected

    def test_intents_consistent_across_modules(self):
        from src.train import INTENTS as train_intents
        from src.predict import INTENTS as predict_intents
        from src.prepare_data import INTENTS as data_intents
        assert train_intents == predict_intents == data_intents


class TestIntentDataset:
    """Tests for the PyTorch Dataset class."""

    def test_dataset_creation(self):
        from src.train import IntentDataset
        from transformers import DistilBertTokenizer

        tokenizer = DistilBertTokenizer.from_pretrained(
            'distilbert-base-multilingual-cased'
        )
        data = [
            {'text': 'hola', 'label': 0},
            {'text': 'adios', 'label': 1},
        ]
        ds = IntentDataset(data, tokenizer)
        assert len(ds) == 2

    def test_dataset_item_has_required_keys(self):
        from src.train import IntentDataset
        from transformers import DistilBertTokenizer

        tokenizer = DistilBertTokenizer.from_pretrained(
            'distilbert-base-multilingual-cased'
        )
        data = [{'text': 'hola mundo', 'label': 3}]
        ds = IntentDataset(data, tokenizer)
        item = ds[0]
        assert 'input_ids' in item
        assert 'attention_mask' in item
        assert 'labels' in item

    def test_dataset_label_tensor(self):
        from src.train import IntentDataset
        from transformers import DistilBertTokenizer

        tokenizer = DistilBertTokenizer.from_pretrained(
            'distilbert-base-multilingual-cased'
        )
        data = [{'text': 'test', 'label': 2}]
        ds = IntentDataset(data, tokenizer)
        item = ds[0]
        assert item['labels'].item() == 2
