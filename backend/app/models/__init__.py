"""
Re-export all models so they can be imported from app.models.
Also ensures Alembic sees every table for autogenerate.
"""

from app.models.user import User, UserRole
from app.models.company import Company
from app.models.job import Job, JobType
from app.models.application import Application, ApplicationStatus

__all__ = [
    "User",
    "UserRole",
    "Company",
    "Job",
    "JobType",
    "Application",
    "ApplicationStatus",
]
