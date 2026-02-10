"""
Application router — /api/applications/*
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.session import get_session
from app.models.user import User, UserRole
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetailResponse,
    ApplicationResponse,
    ApplicationStatusUpdate,
)
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])


# ── Candidate ────────────────────────────────────
@router.post(
    "/jobs/{job_id}/apply",
    response_model=ApplicationResponse,
    status_code=201,
    dependencies=[Depends(require_roles([UserRole.CANDIDATE]))],
)
async def apply_to_job(
    job_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    cover_letter: str | None = Form(default=None),
    resume: UploadFile | None = File(default=None),
):
    data = ApplicationCreate(cover_letter=cover_letter)
    service = ApplicationService(session)
    return await service.apply(job_id, data, current_user, resume)


@router.get(
    "/me",
    response_model=list[ApplicationDetailResponse],
    dependencies=[Depends(require_roles([UserRole.CANDIDATE]))],
)
async def my_applications(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ApplicationService(session)
    return await service.get_my_applications(current_user)


# ── Employer ─────────────────────────────────────
@router.get(
    "/jobs/{job_id}",
    response_model=list[ApplicationDetailResponse],
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def job_applications(
    job_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ApplicationService(session)
    return await service.get_job_applications(job_id, current_user)


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def update_application_status(
    application_id: uuid.UUID,
    data: ApplicationStatusUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ApplicationService(session)
    return await service.update_application_status(application_id, data, current_user)
