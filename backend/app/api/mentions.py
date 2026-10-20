from fastapi import APIRouter, HTTPException, status

from app.schemas.mentions import Mention, MentionCreate
from app.services import mentions as service
from app.services.llm import analyze_mention

router = APIRouter(prefix="/api/mentions", tags=["mentions"])


@router.get("", response_model=list[Mention])
def list_mentions() -> list[Mention]:
    return service.list_mentions()


@router.get("/{mention_id}", response_model=Mention)
def get_mention(mention_id: int) -> Mention:
    mention = service.get_mention(mention_id)
    if mention is None:
        raise HTTPException(status_code=404, detail="Mention not found")
    return mention


@router.post("", response_model=Mention, status_code=status.HTTP_201_CREATED)
def create_mention(mention: MentionCreate) -> Mention:
    classification = analyze_mention(mention.brand, mention.content)
    return service.create_mention(mention, analysis=classification)
