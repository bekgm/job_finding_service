"""
Job service — CRUD + listing with pagination & filters.
"""

import math
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.job import Job
from app.models.user import User
from app.repositories.company_repo import CompanyRepository
from app.repositories.job_repo import JobRepository
from app.schemas.job import (
    JobCreate,
    JobDetailResponse,
    JobFilter,
    JobResponse,
    JobUpdate,
)
from app.utils.pagination import PaginatedResponse


class JobService:
    def __init__(self, session: AsyncSession):
        self.repo = JobRepository(session)
        self.company_repo = CompanyRepository(session)

    async def list_jobs(
        self, filters: JobFilter, page: int = 1, size: int = 20
    ) -> PaginatedResponse[JobDetailResponse]:
        items, total = await self.repo.list_jobs(filters, page, size)
        return PaginatedResponse(
            items=[JobDetailResponse.model_validate(j) for j in items],
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size else 0,
        )

    async def get_job(self, job_id: uuid.UUID) -> JobDetailResponse:
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException("Job not found")
        return JobDetailResponse.model_validate(job)

    async def create_job(self, data: JobCreate, employer: User) -> JobResponse:
        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company:
            raise NotFoundException("Create a company first")

        job = Job(
            title=data.title,
            description=data.description,
            location=data.location,
            is_remote=data.is_remote,
            job_type=data.job_type,
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            company_id=company.id,
        )
        job = await self.repo.create(job)
        return JobResponse.model_validate(job)

    async def update_job(
        self, job_id: uuid.UUID, data: JobUpdate, employer: User
    ) -> JobResponse:
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException("Job not found")

        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company or job.company_id != company.id:
            raise ForbiddenException("Not your job posting")

        job = await self.repo.update(job, data.model_dump(exclude_unset=True))
        return JobResponse.model_validate(job)

    async def delete_job(self, job_id: uuid.UUID, employer: User) -> None:
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException("Job not found")

        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company or job.company_id != company.id:
            raise ForbiddenException("Not your job posting")

        await self.repo.delete(job)

    async def list_employer_jobs(self, employer: User) -> list[JobResponse]:
        company = await self.company_repo.get_by_owner_id(employer.id)
        if not company:
            return []
        jobs = await self.repo.list_by_company(company.id)
        return [JobResponse.model_validate(j) for j in jobs]
