"""
Application repository.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.application import Application


class ApplicationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, app_id: uuid.UUID) -> Application | None:
        stmt = (
            select(Application)
            .options(selectinload(Application.candidate), selectinload(Application.job))
            .where(Application.id == app_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_candidate_and_job(
        self, candidate_id: uuid.UUID, job_id: uuid.UUID
    ) -> Application | None:
        stmt = select(Application).where(
            Application.candidate_id == candidate_id,
            Application.job_id == job_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_candidate(self, candidate_id: uuid.UUID) -> list[Application]:
        stmt = (
            select(Application)
            .options(selectinload(Application.job))
            .where(Application.candidate_id == candidate_id)
            .order_by(Application.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_job(self, job_id: uuid.UUID) -> list[Application]:
        stmt = (
            select(Application)
            .options(selectinload(Application.candidate))
            .where(Application.job_id == job_id)
            .order_by(Application.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, application: Application) -> Application:
        self.session.add(application)
        await self.session.flush()
        await self.session.refresh(application)
        return application

    async def update_status(self, application: Application, status) -> Application:
        application.status = status
        await self.session.flush()
        await self.session.refresh(application)
        return application
