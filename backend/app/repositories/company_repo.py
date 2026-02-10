"""
Company repository.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company


class CompanyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, company_id: uuid.UUID) -> Company | None:
        stmt = select(Company).where(Company.id == company_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_owner_id(self, owner_id: uuid.UUID) -> Company | None:
        stmt = select(Company).where(Company.owner_id == owner_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, company: Company) -> Company:
        self.session.add(company)
        await self.session.flush()
        await self.session.refresh(company)
        return company

    async def update(self, company: Company, data: dict) -> Company:
        for key, value in data.items():
            if value is not None:
                setattr(company, key, value)
        await self.session.flush()
        await self.session.refresh(company)
        return company
