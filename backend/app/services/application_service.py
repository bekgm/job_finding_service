"""
Application service — apply, view, update status, resume upload.
"""

import os
import uuid

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.models.application import Application
from app.models.user import User
from app.repositories.application_repo import ApplicationRepository
from app.repositories.company_repo import CompanyRepository
from app.repositories.job_repo import JobRepository
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetailResponse,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


class ApplicationService:
    def __init__(self, session: AsyncSession):
        self.repo = ApplicationRepository(session)
        self.job_repo = JobRepository(session)
        self.company_repo = CompanyRepository(session)

    async def apply(
        self,
        job_id: uuid.UUID,
        data: ApplicationCreate,
        candidate: User,
        resume: UploadFile | None = None,
    ) -> ApplicationResponse:
        # Check job exists & is active
        job = await self.job_repo.get_by_id(job_id)
        if not job or not job.is_active:
            raise NotFoundException("Job not found or inactive")

        # Prevent duplicate applications
        existing = await self.repo.get_by_candidate_and_job(candidate.id, job_id)
        if existing:
            raise ConflictException("Already applied to this job")

        resume_path = None
        if resume:
            resume_path = await self._save_resume(resume, candidate.id)

        application = Application(
            candidate_id=candidate.id,
            job_id=job_id,
            cover_letter=data.cover_letter,
            resume_path=resume_path,
        )
        application = await self.repo.create(application)
        return ApplicationResponse.model_validate(application)

    async def get_my_applications(
        self, candidate: User
    ) -> list[ApplicationDetailResponse]:
        apps = await self.repo.list_by_candidate(candidate.id)
        return [
            ApplicationDetailResponse(
                **ApplicationResponse.model_validate(a).model_dump(),
                job_title=a.job.title if a.job else None,
            )
            for a in apps
        ]

    async def get_job_applications(
        self, job_id: uuid.UUID, employer: User
    ) -> list[ApplicationDetailResponse]:
        """Employer views applications for their job."""
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise NotFoundException("Job not found")

        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company or job.company_id != company.id:
            raise ForbiddenException("Not your job posting")

        apps = await self.repo.list_by_job(job_id)
        return [
            ApplicationDetailResponse(
                **ApplicationResponse.model_validate(a).model_dump(),
                candidate_name=a.candidate.full_name if a.candidate else None,
            )
            for a in apps
        ]

    async def update_application_status(
        self,
        application_id: uuid.UUID,
        data: ApplicationStatusUpdate,
        employer: User,
    ) -> ApplicationResponse:
        application = await self.repo.get_by_id(application_id)
        if not application:
            raise NotFoundException("Application not found")

        # Verify employer owns the job's company
        job = await self.job_repo.get_by_id(application.job_id)
        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company or not job or job.company_id != company.id:
            raise ForbiddenException("Not your job posting")

        application = await self.repo.update_status(application, data.status)
        return ApplicationResponse.model_validate(application)

    # ── Private ──────────────────────────────────
    @staticmethod
    async def _save_resume(file: UploadFile, user_id: uuid.UUID) -> str:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise BadRequestException("Only PDF files are allowed")

        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise BadRequestException(
                f"File too large (max {settings.MAX_UPLOAD_SIZE_MB}MB)"
            )

        upload_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex}.pdf"
        path = os.path.join(upload_dir, filename)

        with open(path, "wb") as f:
            f.write(content)

        return path
