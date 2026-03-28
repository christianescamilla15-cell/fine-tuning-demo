"""Tests for data preparation pipeline."""
import os
import json
import tempfile
import csv
import pytest

from src.prepare_data import load_data, split_data, save_splits, INTENTS


class TestLoadData:
    """Tests for CSV loading."""

    def test_load_returns_texts_and_labels(self):
        texts, labels = load_data('data/intents.csv')
        assert len(texts) > 0
        assert len(labels) > 0
        assert len(texts) == len(labels)

    def test_load_correct_count(self):
        texts, labels = load_data('data/intents.csv')
        assert len(texts) == 100  # 20 per intent * 5 intents

    def test_labels_are_valid_indices(self):
        _, labels = load_data('data/intents.csv')
        for label in labels:
            assert 0 <= label < len(INTENTS)

    def test_all_intents_represented(self):
        _, labels = load_data('data/intents.csv')
        unique = set(labels)
        assert unique == {0, 1, 2, 3, 4}

    def test_balanced_distribution(self):
        _, labels = load_data('data/intents.csv')
        for i in range(len(INTENTS)):
            count = labels.count(i)
            assert count == 20, f"Intent {INTENTS[i]} has {count} samples, expected 20"

    def test_texts_are_nonempty_strings(self):
        texts, _ = load_data('data/intents.csv')
        for text in texts:
            assert isinstance(text, str)
            assert len(text.strip()) > 0


class TestSplitData:
    """Tests for train/test splitting."""

    def test_split_sizes(self):
        texts, labels = load_data('data/intents.csv')
        train_t, test_t, train_l, test_l = split_data(texts, labels, test_size=0.2)
        assert len(train_t) == 80
        assert len(test_t) == 20

    def test_split_preserves_total(self):
        texts, labels = load_data('data/intents.csv')
        train_t, test_t, train_l, test_l = split_data(texts, labels)
        assert len(train_t) + len(test_t) == len(texts)

    def test_split_is_deterministic(self):
        texts, labels = load_data('data/intents.csv')
        t1, te1, _, _ = split_data(texts, labels)
        t2, te2, _, _ = split_data(texts, labels)
        assert t1 == t2
        assert te1 == te2


class TestSaveSplits:
    """Tests for saving JSON splits."""

    def test_save_creates_files(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            save_splits(['a', 'b'], ['c'], [0, 1], [0], output_dir=tmpdir)
            assert os.path.exists(os.path.join(tmpdir, 'train.json'))
            assert os.path.exists(os.path.join(tmpdir, 'test.json'))

    def test_save_json_structure(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            save_splits(['hello', 'world'], ['test'], [0, 1], [2], output_dir=tmpdir)
            with open(os.path.join(tmpdir, 'train.json')) as f:
                data = json.load(f)
            assert len(data) == 2
            assert data[0]['text'] == 'hello'
            assert data[0]['label'] == 0

    def test_save_preserves_unicode(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            save_splits(['hola como estas'], [], [0], [], output_dir=tmpdir)
            with open(os.path.join(tmpdir, 'train.json'), encoding='utf-8') as f:
                data = json.load(f)
            assert 'hola' in data[0]['text']
