"""Run from backend/: python -m scripts.evaluate_analysis"""
import json
from pathlib import Path

from app.services.analysis import analyze


def evaluate() -> dict:
    source = Path(__file__).resolve().parents[1] / "data" / "evaluation_cases.json"
    cases = json.loads(source.read_text(encoding="utf-8"))
    fields = ("relevant", "sentiment", "action_required")
    matches = {field: 0 for field in fields}
    details = []
    for case in cases:
        actual = analyze(case["brand"], case["content"]).model_dump(mode="json")
        checked = {field: actual[field] == case["expected"][field] for field in fields}
        for field in fields:
            matches[field] += int(checked[field])
        details.append({"category": case["category"], "checks": checked})
    return {
        "count": len(cases),
        "field_accuracy": {field: matches[field] / len(cases) for field in fields},
        "strict_accuracy": sum(all(row["checks"].values()) for row in details) / len(cases),
        "details": details,
    }


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2))
