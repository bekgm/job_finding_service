"""
Company router — /api/companies/*
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.session import get_session
from app.models.user import User, UserRole
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate
from app.services.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post(
    "",
    response_model=CompanyResponse,
    status_code=201,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def create_company(
    data: CompanyCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = CompanyService(session)
    return await service.create_company(data, current_user)


@router.get("/me", response_model=CompanyResponse)
async def get_my_company(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = CompanyService(session)
    return await service.get_my_company(current_user)


@router.patch(
    "/me",
    response_model=CompanyResponse,
    dependencies=[Depends(require_roles([UserRole.EMPLOYER]))],
)
async def update_my_company(
    data: CompanyUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = CompanyService(session)
    return await service.update_company(data, current_user)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    service = CompanyService(session)
    return await service.get_company(company_id)
