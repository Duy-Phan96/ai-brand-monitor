import json
from pathlib import Path

from app.schemas.mentions import MentionCreate
from app.services.mentions import count_mentions, create_mention


def main() -> None:
    if count_mentions() > 0:
        print("Database is not empty; no demo records were inserted.")
        return
    source = Path(__file__).resolve().parents[1] / "data" / "sample_mentions.json"
    records = json.loads(source.read_text(encoding="utf-8"))
    for item in records:
        create_mention(MentionCreate.model_validate(item))
    print(f"Inserted {len(records)} fictional demo mentions.")


if __name__ == "__main__":
    main()
