"""
Pydantic schemas for Company.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    website: str | None = None
    location: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    website: str | None = None
    location: str | None = None


class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    website: str | None
    location: str | None
    owner_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
