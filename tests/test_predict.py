"""Tests for prediction/inference pipeline."""
import pytest
from src.predict import predict_intent, INTENTS, reset_model


@pytest.fixture(autouse=True)
def clear_model_cache():
    """Reset the cached model before each test."""
    reset_model()
    yield
    reset_model()


class TestPredictIntent:
    """Tests for the predict_intent function."""

    def test_returns_dict(self):
        result = predict_intent('hola')
        assert isinstance(result, dict)

    def test_result_has_required_keys(self):
        result = predict_intent('quiero comprar')
        assert 'text' in result
        assert 'intent' in result
        assert 'confidence' in result
        assert 'all_scores' in result

    def test_intent_is_valid(self):
        result = predict_intent('necesito ayuda')
        assert result['intent'] in INTENTS

    def test_confidence_is_probability(self):
        result = predict_intent('hola buenos dias')
        assert 0.0 <= result['confidence'] <= 1.0

    def test_all_scores_sum_to_one(self):
        result = predict_intent('tengo un problema')
        total = sum(result['all_scores'].values())
        assert abs(total - 1.0) < 0.01, f"Scores sum to {total}, expected ~1.0"

    def test_all_scores_has_all_intents(self):
        result = predict_intent('hola')
        for intent in INTENTS:
            assert intent in result['all_scores']

    def test_text_preserved_in_result(self):
        text = 'quiero cancelar mi suscripcion'
        result = predict_intent(text)
        assert result['text'] == text

    def test_handles_empty_string(self):
        result = predict_intent('')
        assert result['intent'] in INTENTS

    def test_handles_long_text(self):
        long_text = 'necesito ayuda con mi pedido ' * 50
        result = predict_intent(long_text)
        assert result['intent'] in INTENTS
