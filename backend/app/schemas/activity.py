from __future__ import annotations

from app.schemas.common import BaseReadSchema


class ActivityRead(BaseReadSchema):
    entity_type: str
    entity_id: int | None
    action: str
    message: str
    metadata_json: dict | None
