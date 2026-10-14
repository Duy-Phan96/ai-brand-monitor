"""Transparent, conservative deterministic analysis fallback.

This module deliberately does not claim to be model inference.
Heuristics are English-only and are not a substitute for an LLM.
"""
import re

from app.schemas.mentions import AnalysisMethod, MentionAnalysis, Priority, Sentiment


def _contains(text: str, words: set[str]) -> bool:
    return any(re.search(r"\b" + re.escape(word) + r"\b", text) for word in words)


POSITIVE = {"great", "fantastic", "love", "excellent", "comfortable", "helpful"}
NEGATIVE = {"broken", "stopped", "disappointing", "bad", "terrible", "unanswered"}
SUPPORT = {"support", "reply", "replied", "warranty", "refund", "charging", "broken", "stopped"}
PRODUCT = {"headphones", "battery", "sound", "model", "charging"}
QUESTIONS = {"?", "does anyone", "can i", "how do i"}


def analyze(brand: str, content: str) -> MentionAnalysis:
    text = content.casefold()
    brand_re = r"(?<!\w)" + re.escape(brand.casefold()) + r"(?!\w)"
    relevant = bool(re.search(brand_re, text))

    # Conservative heuristic: simple brand name matches are not always relevant.
    if brand.casefold() == "aurora" and not _contains(text, PRODUCT | SUPPORT):
        relevant = False

    positive = _contains(text, POSITIVE)
    negative = _contains(text, NEGATIVE)
    if positive and negative:
        sentiment = Sentiment.mixed
    elif positive:
        sentiment = Sentiment.positive
    elif negative:
        sentiment = Sentiment.negative
    else:
        sentiment = Sentiment.neutral

    support_issue = relevant and negative and _contains(text, SUPPORT)
    is_question = "?" in text or _contains(text, {"does anyone", "can i", "how do i"})
    action_required = support_issue or (relevant and is_question)
    topic = (
        "unrelated" if not relevant else
        "support" if _contains(text, SUPPORT) else
        "product feedback" if _contains(text, PRODUCT) else
        "general"
    )
    priority = Priority.high if support_issue else Priority.medium if action_required else Priority.low
    action = (
        "Review the support complaint and respond with a next step." if support_issue
        else "Answer the user's question or provide a relevant resource." if action_required
        else None
    )
    explanation = (
        "A deterministic English-language keyword heuristic was used. "
        "The result is not LLM inference and requires human verification."
    )
    return MentionAnalysis(
        relevant=relevant,
        sentiment=sentiment,
        topic=topic,
        action_required=action_required,
        priority=priority,
        summary=content.strip()[:240],
        explanation=explanation,
        suggested_action=action,
        method=AnalysisMethod.deterministic,
    )
