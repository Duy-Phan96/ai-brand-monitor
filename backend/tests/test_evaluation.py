from scripts.evaluate_analysis import evaluate


def test_evaluation_covers_all_labeled_cases():
    result = evaluate()
    assert result["count"] == 10
    assert len(result["details"]) == 10
    assert all(0 <= score <= 1 for score in result["field_accuracy"].values())
    assert 0 <= result["strict_accuracy"] <= 1
    categories = {row["category"] for row in result["details"]}
    assert {"negation", "German", "prompt injection", "sarcasm"} <= categories
