import json
from pathlib import Path

from app.schemas.mentions import MentionCreate
from app.services.mentions import count_mentions, create_mention
from app.services.analysis import analyze


def main() -> None:
    if count_mentions() > 0:
        print("Database is not empty; no demo records were inserted.")
        return
    source = Path(__file__).resolve().parents[1] / "data" / "sample_mentions.json"
    records = json.loads(source.read_text(encoding="utf-8"))
    for item in records:
        mention = MentionCreate.model_validate(item)
        create_mention(mention, analyze(mention.brand, mention.content))
    print(f"Inserted {len(records)} fictional demo mentions.")


if __name__ == "__main__":
    main()
