import csv
import io
import json

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.mentions import Mention, MentionImport
from app.services.llm import analyze_mention
from app.services.mentions import import_mentions, list_mentions

router = APIRouter(prefix="/api/mentions", tags=["transfer"])
MAX_RECORDS = 500


class ImportPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mentions: list[MentionImport] = Field(min_length=1, max_length=MAX_RECORDS)


class ImportResult(BaseModel):
    imported: int


@router.post("/import", response_model=ImportResult)
def import_json(payload: ImportPayload) -> ImportResult:
    # The complete batch is validated before analysis or transactional insertion.
    records = [(m, analyze_mention(m.brand, m.content)) for m in payload.mentions]
    return ImportResult(imported=import_mentions(records))


@router.get("/export")
def export_mentions(format: str = "json") -> Response:
    mentions: list[Mention] = list_mentions()
    if format == "json":
        body = json.dumps(
            {"mentions": [m.model_dump(mode="json") for m in mentions]},
            indent=2,
        )
        return Response(body, media_type="application/json",
                        headers={"Content-Disposition": 'attachment; filename="mentions.json"'})
    if format == "csv":
        out = io.StringIO()
        fields = ["id", "brand", "content", "platform", "published_at", "source_url",
                  "is_sample", "relevant", "sentiment", "topic", "action_required",
                  "priority", "summary", "explanation", "suggested_action",
                  "method", "model_name"]
        writer = csv.DictWriter(out, fieldnames=fields)
        writer.writeheader()
        for mention in mentions:
            base = mention.model_dump(mode="json", exclude={"analysis"})
            # Keep the established flat CSV contract; JSON retains both languages.
            analysis = mention.analysis.model_dump(mode="json", exclude={"localized_text"}) if mention.analysis else {}
            record = {**base, **analysis}
            # Prevent CSV formula injection when exported data is opened in spreadsheets.
            for key, value in record.items():
                if isinstance(value, str) and value.lstrip().startswith(("=", "+", "-", "@")):
                    record[key] = "'" + value
            writer.writerow(record)
        return Response(out.getvalue(), media_type="text/csv; charset=utf-8",
                        headers={"Content-Disposition": 'attachment; filename="mentions.csv"'})
    raise HTTPException(status_code=422, detail="Supported export formats: json, csv")
