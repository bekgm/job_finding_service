"""
FastAPI dependencies for authentication & authorization.
"""

import uuid
from typing import Annotated, List

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.db.session import get_session
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Extract and validate the current user from the access token."""
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise UnauthorizedException("Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException()

    repo = UserRepository(session)
    user = await repo.get_by_id(uuid.UUID(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")
    return user


def require_roles(allowed_roles: List[UserRole]):
    """
    Returns a dependency that checks if the current user has one of the allowed roles.
    Usage:  Depends(require_roles([UserRole.EMPLOYER]))
    """

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException()
        return current_user

    return role_checker
