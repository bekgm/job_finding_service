"""
Job ORM model.
Belongs to a company. Supports remote flag + salary range for filtering.
"""

import enum

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class Job(Base):
    __tablename__ = "jobs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    job_type: Mapped[JobType] = mapped_column(
        Enum(JobType), nullable=False, default=JobType.FULL_TIME
    )
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    company_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    company = relationship("Company", back_populates="jobs", lazy="selectin")
    applications = relationship(
        "Application", back_populates="job", lazy="selectin", cascade="all, delete-orphan"
    )
