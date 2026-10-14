import json

from app.core.database import connect, initialize_database
from app.schemas.mentions import Mention, MentionAnalysis, MentionCreate


def _map_row(row: object) -> Mention:
    analysis_json = row["analysis_json"]  # type: ignore[index]
    return Mention(
        id=row["id"],  # type: ignore[index]
        brand=row["brand"],  # type: ignore[index]
        content=row["content"],  # type: ignore[index]
        platform=row["platform"],  # type: ignore[index]
        published_at=row["published_at"],  # type: ignore[index]
        source_url=row["source_url"],  # type: ignore[index]
        is_sample=bool(row["is_sample"]),  # type: ignore[index]
        analysis=(
            MentionAnalysis.model_validate_json(analysis_json)
            if analysis_json
            else None
        ),
    )


def create_mention(
    data: MentionCreate, analysis: MentionAnalysis | None = None
) -> Mention:
    initialize_database()
    with connect() as connection:
        result = connection.execute(
            """INSERT INTO mentions (
                brand, content, platform, published_at, source_url,
                is_sample, analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                data.brand,
                data.content,
                data.platform,
                data.published_at.isoformat(),
                str(data.source_url) if data.source_url else None,
                int(data.is_sample),
                analysis.model_dump_json() if analysis else None,
            ),
        )
        record = connection.execute(
            "SELECT * FROM mentions WHERE id = ?", (result.lastrowid,)
        ).fetchone()
        assert record is not None
        return _map_row(record)


def list_mentions() -> list[Mention]:
    initialize_database()
    with connect() as connection:
        rows = connection.execute(
            "SELECT * FROM mentions ORDER BY published_at DESC, id DESC"
        ).fetchall()
        return [_map_row(row) for row in rows]


def get_mention(mention_id: int) -> Mention | None:
    initialize_database()
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM mentions WHERE id = ?", (mention_id,)
        ).fetchone()
        return _map_row(row) if row else None


def count_mentions() -> int:
    initialize_database()
    with connect() as connection:
        return int(connection.execute("SELECT COUNT(*) FROM mentions").fetchone()[0])


def import_mentions(records: list[tuple[MentionCreate, MentionAnalysis]]) -> int:
    """Store one validated batch atomically."""
    initialize_database()
    with connect() as connection:
        connection.executemany(
            """INSERT INTO mentions (
                brand, content, platform, published_at, source_url,
                is_sample, analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
            [
                (
                    mention.brand,
                    mention.content,
                    mention.platform,
                    mention.published_at.isoformat(),
                    str(mention.source_url) if mention.source_url else None,
                    int(mention.is_sample),
                    analysis.model_dump_json(),
                )
                for mention, analysis in records
            ],
        )
    return len(records)
