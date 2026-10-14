import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


def database_path() -> Path:
    return Path(os.environ.get("BRAND_MONITOR_DB_PATH", "data/ai_brand_monitor.db"))


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except BaseException:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS mentions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                content TEXT NOT NULL,
                platform TEXT NOT NULL,
                published_at TEXT NOT NULL,
                source_url TEXT,
                is_sample INTEGER NOT NULL CHECK (is_sample IN (0, 1)),
                analysis_json TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_mentions_published_at
                ON mentions(published_at);
            CREATE INDEX IF NOT EXISTS idx_mentions_platform
                ON mentions(platform);
            """
        )
