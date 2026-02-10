"""
Job repository — handles filtering + pagination at the DB level.
"""

import uuid

from sqlalchemy import Select, func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.job import Job
from app.schemas.job import JobFilter


class JobRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, job_id: uuid.UUID) -> Job | None:
        stmt = (
            select(Job)
            .options(selectinload(Job.company))
            .where(Job.id == job_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_jobs(
        self,
        filters: JobFilter,
        page: int = 1,
        size: int = 20,
    ) -> tuple[list[Job], int]:
        """Return (items, total_count) with filters + pagination applied."""
        base = select(Job).options(selectinload(Job.company)).where(Job.is_active == True)
        base = self._apply_filters(base, filters)

        # Total count
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0

        # Paginated results
        stmt = base.order_by(Job.created_at.desc()).offset((page - 1) * size).limit(size)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def list_by_company(self, company_id: uuid.UUID) -> list[Job]:
        stmt = select(Job).where(Job.company_id == company_id).order_by(Job.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, job: Job) -> Job:
        self.session.add(job)
        await self.session.flush()
        await self.session.refresh(job)
        return job

    async def update(self, job: Job, data: dict) -> Job:
        for key, value in data.items():
            if value is not None:
                setattr(job, key, value)
        await self.session.flush()
        await self.session.refresh(job)
        return job

    async def delete(self, job: Job) -> None:
        await self.session.delete(job)
        await self.session.flush()

    # ── Private ──────────────────────────────────
    @staticmethod
    def _apply_filters(stmt: Select, filters: JobFilter) -> Select:
        if filters.search:
            pattern = f"%{filters.search}%"
            stmt = stmt.where(
                or_(
                    Job.title.ilike(pattern),
                    Job.description.ilike(pattern),
                )
            )
        if filters.is_remote is not None:
            stmt = stmt.where(Job.is_remote == filters.is_remote)
        if filters.job_type is not None:
            stmt = stmt.where(Job.job_type == filters.job_type)
        if filters.salary_min is not None:
            stmt = stmt.where(Job.salary_max >= filters.salary_min)
        if filters.salary_max is not None:
            stmt = stmt.where(Job.salary_min <= filters.salary_max)
        return stmt
