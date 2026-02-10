"""
Job router — /api/jobs/*
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.session import get_session
from app.models.job import JobType
from app.models.user import User, UserRole
from app.schemas.job import (
    JobCreate,
    JobDetailResponse,
    JobFilter,
    JobResponse,
    JobUpdate,
)
from app.services.job_service import JobService
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# ── Public ───────────────────────────────────────
@router.get("", response_model=PaginatedResponse[JobDetailResponse])
async def list_jobs(
    session: Annotated[AsyncSession, Depends(get_session)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_remote: bool | None = None,
    job_type: JobType | None = None,
    salary_min: int | None = None,
    salary_max: int | None = None,
):
    filters = JobFilter(
        search=search,
        is_remote=is_remote,
        job_type=job_type,
        salary_min=salary_min,
        salary_max=salary_max,
    )
    service = JobService(session)
    return await service.list_jobs(filters, page, size)


# Static path MUST come before /{job_id} to avoid route conflict
@router.get(
    "/employer/my-jobs",
    response_model=list[JobResponse],
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def list_my_jobs(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = JobService(session)
    return await service.list_employer_jobs(current_user)


@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job(
    job_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    service = JobService(session)
    return await service.get_job(job_id)


# ── Employer ─────────────────────────────────────
@router.post(
    "",
    response_model=JobResponse,
    status_code=201,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def create_job(
    data: JobCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = JobService(session)
    return await service.create_job(data, current_user)


@router.patch(
    "/{job_id}",
    response_model=JobResponse,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def update_job(
    job_id: uuid.UUID,
    data: JobUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = JobService(session)
    return await service.update_job(job_id, data, current_user)


@router.delete(
    "/{job_id}",
    status_code=204,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def delete_job(
    job_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = JobService(session)
    await service.delete_job(job_id, current_user)
