"""
Company service — business logic for company CRUD.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.models.company import Company
from app.models.user import User
from app.repositories.company_repo import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate


class CompanyService:
    def __init__(self, session: AsyncSession):
        self.repo = CompanyRepository(session)

    async def create_company(self, data: CompanyCreate, owner: User) -> CompanyResponse:
        existing = await self.repo.get_by_owner_id(owner.id)
        if existing:
            raise ConflictException("You already have a company")

        company = Company(
            name=data.name,
            description=data.description,
            website=data.website,
            location=data.location,
            owner_id=owner.id,
        )
        company = await self.repo.create(company)
        return CompanyResponse.model_validate(company)

    async def get_company(self, company_id) -> CompanyResponse:
        company = await self.repo.get_by_id(company_id)
        if not company:
            raise NotFoundException("Company not found")
        return CompanyResponse.model_validate(company)

    async def get_my_company(self, owner: User) -> CompanyResponse:
        company = await self.repo.get_by_owner_id(owner.id)
        if not company:
            raise NotFoundException("You don't have a company yet")
        return CompanyResponse.model_validate(company)

    async def update_company(self, data: CompanyUpdate, owner: User) -> CompanyResponse:
        company = await self.repo.get_by_owner_id(owner.id)
        if not company:
            raise NotFoundException("You don't have a company yet")
        company = await self.repo.update(company, data.model_dump(exclude_unset=True))
        return CompanyResponse.model_validate(company)
