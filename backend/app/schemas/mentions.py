from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    StrictBool,
    field_validator,
    model_validator,
)


class Sentiment(str, Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"
    mixed = "mixed"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AnalysisMethod(str, Enum):
    deterministic = "deterministic"
    llm = "llm"
    human = "human"


class MentionFields(BaseModel):
    """Stored fields: reading legacy data must not silently rewrite it."""
    model_config = ConfigDict(extra="forbid")

    brand: str = Field(min_length=1, max_length=120)
    content: str = Field(min_length=1, max_length=10000)
    platform: str = Field(min_length=1, max_length=80)
    published_at: datetime
    source_url: HttpUrl | None = None
    is_sample: bool = True


class MentionCreate(MentionFields):
    published_at: AwareDatetime
    is_sample: StrictBool = True

    @field_validator("brand", "content", "platform", mode="before")
    @classmethod
    def normalize_required_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Required text must contain non-whitespace characters")
            if "\x00" in value:
                raise ValueError("Required text must not contain NUL characters")
            try:
                value.encode("utf-8")
            except UnicodeEncodeError:
                raise ValueError("Required text must contain valid Unicode characters") from None
        return value

    @field_validator("is_sample")
    @classmethod
    def fictional_only(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Only fictional sample records are permitted (is_sample must be true)")
        return value

    @field_validator("published_at", mode="before")
    @classmethod
    def explicit_timezone(cls, value: Any) -> datetime:
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except ValueError:
                raise ValueError("Use an ISO 8601 timestamp with an explicit timezone") from None
        if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Publication timestamp must include an explicit timezone")
        try:
            return value.astimezone(timezone.utc)
        except OverflowError:
            raise ValueError("Publication timestamp is outside the supported UTC range") from None


class MentionImport(MentionCreate):
    """Accept exports, but never restore their IDs or trust their analysis."""

    @model_validator(mode="before")
    @classmethod
    def discard_export_metadata(cls, value: Any) -> Any:
        if isinstance(value, dict):
            return {key: item for key, item in value.items() if key not in {"id", "analysis"}}
        return value


class AnalysisText(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    summary: str = Field(min_length=1, max_length=1200)
    explanation: str = Field(min_length=1, max_length=2400)
    suggested_action: str | None = Field(default=None, min_length=1, max_length=1200)


class BilingualAnalysisText(BaseModel):
    model_config = ConfigDict(extra="forbid")

    de: AnalysisText
    en: AnalysisText


class MentionAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    relevant: bool
    sentiment: Sentiment
    topic: str = Field(min_length=1, max_length=120)
    action_required: bool
    priority: Priority
    summary: str = Field(min_length=1)
    explanation: str = Field(min_length=1)
    suggested_action: str | None = None
    method: AnalysisMethod
    model_name: str | None = None
    # Optional for compatibility with analyses already stored in SQLite.
    localized_text: BilingualAnalysisText | None = None


class Mention(MentionFields):
    id: int
    analysis: MentionAnalysis | None = None
