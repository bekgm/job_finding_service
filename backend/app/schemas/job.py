"""
Pydantic schemas for Job.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.job import JobType
from app.schemas.company import CompanyResponse


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str | None = None
    is_remote: bool = False
    job_type: JobType = JobType.FULL_TIME
    salary_min: int | None = None
    salary_max: int | None = None


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    location: str | None = None
    is_remote: bool | None = None
    job_type: JobType | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    is_active: bool | None = None


class JobResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    location: str | None
    is_remote: bool
    job_type: JobType
    salary_min: int | None
    salary_max: int | None
    is_active: bool
    company_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class JobDetailResponse(JobResponse):
    """Includes nested company info for the detail page."""
    company: CompanyResponse

    model_config = {"from_attributes": True}


class JobFilter(BaseModel):
    """Query params for filtering the job list."""
    search: str | None = None
    is_remote: bool | None = None
    job_type: JobType | None = None
    salary_min: int | None = None
    salary_max: int | None = None
