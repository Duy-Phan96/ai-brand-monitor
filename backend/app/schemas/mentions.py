from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


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


class MentionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    brand: str = Field(min_length=1, max_length=120)
    content: str = Field(min_length=1, max_length=10000)
    platform: str = Field(min_length=1, max_length=80)
    published_at: datetime
    source_url: HttpUrl | None = None
    is_sample: bool = True


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


class Mention(MentionCreate):
    id: int
    analysis: MentionAnalysis | None = None
