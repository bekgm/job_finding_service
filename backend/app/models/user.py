"""
User ORM model.
role is an enum: 'candidate' or 'employer'.
"""

import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer"


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(320), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(1024), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.CANDIDATE
    )
    is_active: Mapped[bool] = mapped_column(default=True)

    # Relationships (defined later via back_populates)
    company = relationship("Company", back_populates="owner", uselist=False, lazy="selectin")
    applications = relationship("Application", back_populates="candidate", lazy="selectin")
