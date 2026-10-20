from app.schemas.mentions import AnalysisMethod, Priority, Sentiment
from app.services.analysis import analyze


def test_positive_brand_feedback() -> None:
    result = analyze("Aurora", "Aurora headphones sound fantastic.")
    assert result.relevant
    assert result.sentiment == Sentiment.positive
    assert result.priority == Priority.low
    assert result.method == AnalysisMethod.deterministic


def test_support_complaint_requires_action() -> None:
    result = analyze(
        "Aurora", "My Aurora headphones stopped charging. Support has not replied."
    )
    assert result.relevant
    assert result.sentiment == Sentiment.negative
    assert result.action_required
    assert result.priority == Priority.high


def test_unrelated_ambiguous_brand_name() -> None:
    result = analyze("Aurora", "We saw a beautiful aurora in the sky last night.")
    assert not result.relevant


def test_mixed_feedback() -> None:
    result = analyze("Aurora", "Aurora headphones are comfortable but battery is disappointing.")
    assert result.sentiment == Sentiment.mixed


def test_question_recommends_follow_up() -> None:
    result = analyze("Aurora", "Do Aurora headphones work with Linux?")
    assert result.action_required
    assert result.priority == Priority.medium
