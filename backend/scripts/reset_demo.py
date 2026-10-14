"""Explicit, safe reset for local fictional demo data.

Run from backend/: python -m scripts.reset_demo --confirm
"""
import argparse
import json
from pathlib import Path

from app.core.database import connect, database_path, initialize_database
from app.schemas.mentions import MentionCreate
from app.services.analysis import analyze
from app.services.mentions import import_mentions


def reset_demo() -> int:
    initialize_database()
    source = Path(__file__).resolve().parents[1] / "data" / "sample_mentions.json"
    samples = [MentionCreate.model_validate(item) for item in json.loads(source.read_text(encoding="utf-8"))]
    if any(not item.is_sample for item in samples):
        raise ValueError("Demo source may only contain fictional records")
    # Do not silently delete user-entered or non-sample records.
    with connect() as connection:
        non_samples = connection.execute(
            "SELECT COUNT(*) FROM mentions WHERE is_sample = 0"
        ).fetchone()[0]
        if non_samples:
            raise RuntimeError("Refusing reset: database contains non-sample records")
        connection.execute("DELETE FROM mentions WHERE is_sample = 1")
    return import_mentions([(m, analyze(m.brand, m.content)) for m in samples])


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset fictional demo data")
    parser.add_argument("--confirm", action="store_true", help="Confirm destructive reset of sample records")
    args = parser.parse_args()
    if not args.confirm:
        parser.error("Pass --confirm to replace existing fictional sample records")
    print(f"Restored {reset_demo()} fictional records in {database_path()}")


if __name__ == "__main__":
    main()
