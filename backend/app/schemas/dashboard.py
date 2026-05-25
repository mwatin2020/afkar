from __future__ import annotations

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_projects: int
    active_projects: int
    total_tasks: int
    open_tasks: int
    completed_tasks: int
    total_ideas: int
    sandbox_ideas: int
    approved_ideas: int
    frozen_ideas: int
