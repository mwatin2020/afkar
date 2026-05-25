"""create domain tables

Revision ID: 20260520_0134
Revises: 20260520_0119
Create Date: 2026-05-20 01:34:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260520_0134"
down_revision: str | None = "20260520_0119"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


project_status = postgresql.ENUM("ACTIVE", "PAUSED", "ARCHIVED", name="project_status", create_type=False)
task_status = postgresql.ENUM("TODO", "IN_PROGRESS", "BLOCKED", "DONE", "ARCHIVED", name="task_status", create_type=False)
task_priority = postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="task_priority", create_type=False)
idea_category = postgresql.ENUM("PRODUCT", "TECHNICAL", "PHILOSOPHY", "BUSINESS", "PATENT", "PERSONAL", "OTHER", name="idea_category", create_type=False)
idea_confidentiality = postgresql.ENUM("LOW", "MEDIUM", "HIGH", "SECRET", name="idea_confidentiality", create_type=False)
idea_maturity = postgresql.ENUM("RAW", "EARLY", "MEDIUM", "STRONG", "READY", name="idea_maturity", create_type=False)
idea_status = postgresql.ENUM("RAW", "SANDBOX", "UNDER_REVIEW", "APPROVED", "FROZEN", "DELETED", name="idea_status", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    project_status.create(bind, checkfirst=True)
    task_status.create(bind, checkfirst=True)
    task_priority.create(bind, checkfirst=True)
    idea_category.create(bind, checkfirst=True)
    idea_confidentiality.create(bind, checkfirst=True)
    idea_maturity.create(bind, checkfirst=True)
    idea_status.create(bind, checkfirst=True)

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", project_status, nullable=False, server_default="ACTIVE"),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_id"), "projects", ["id"], unique=False)
    op.create_index(op.f("ix_projects_owner_id"), "projects", ["owner_id"], unique=False)
    op.create_unique_constraint("uq_projects_name", "projects", ["name"])

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("color", sa.String(length=32), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tags_id"), "tags", ["id"], unique=False)
    op.create_index(op.f("ix_tags_name"), "tags", ["name"], unique=True)
    op.create_index(op.f("ix_tags_owner_id"), "tags", ["owner_id"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", task_status, nullable=False, server_default="TODO"),
        sa.Column("priority", task_priority, nullable=False, server_default="MEDIUM"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tasks_id"), "tasks", ["id"], unique=False)
    op.create_index(op.f("ix_tasks_owner_id"), "tasks", ["owner_id"], unique=False)
    op.create_index(op.f("ix_tasks_priority"), "tasks", ["priority"], unique=False)
    op.create_index(op.f("ix_tasks_project_id"), "tasks", ["project_id"], unique=False)
    op.create_index(op.f("ix_tasks_status"), "tasks", ["status"], unique=False)
    op.create_index(op.f("ix_tasks_title"), "tasks", ["title"], unique=False)

    op.create_table(
        "ideas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", idea_category, nullable=False, server_default="OTHER"),
        sa.Column("confidentiality", idea_confidentiality, nullable=False, server_default="MEDIUM"),
        sa.Column("maturity", idea_maturity, nullable=False, server_default="RAW"),
        sa.Column("status", idea_status, nullable=False, server_default="RAW"),
        sa.Column("decision_note", sa.Text(), nullable=True),
        sa.Column("frozen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ideas_category"), "ideas", ["category"], unique=False)
    op.create_index(op.f("ix_ideas_confidentiality"), "ideas", ["confidentiality"], unique=False)
    op.create_index(op.f("ix_ideas_id"), "ideas", ["id"], unique=False)
    op.create_index(op.f("ix_ideas_maturity"), "ideas", ["maturity"], unique=False)
    op.create_index(op.f("ix_ideas_owner_id"), "ideas", ["owner_id"], unique=False)
    op.create_index(op.f("ix_ideas_project_id"), "ideas", ["project_id"], unique=False)
    op.create_index(op.f("ix_ideas_status"), "ideas", ["status"], unique=False)
    op.create_index(op.f("ix_ideas_title"), "ideas", ["title"], unique=False)

    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_activity_logs_action"), "activity_logs", ["action"], unique=False)
    op.create_index(op.f("ix_activity_logs_entity_id"), "activity_logs", ["entity_id"], unique=False)
    op.create_index(op.f("ix_activity_logs_entity_type"), "activity_logs", ["entity_type"], unique=False)
    op.create_index(op.f("ix_activity_logs_id"), "activity_logs", ["id"], unique=False)
    op.create_index(op.f("ix_activity_logs_owner_id"), "activity_logs", ["owner_id"], unique=False)

    op.create_table(
        "task_tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("task_id", "tag_id", name="uq_task_tag"),
    )
    op.create_index(op.f("ix_task_tags_tag_id"), "task_tags", ["tag_id"], unique=False)
    op.create_index(op.f("ix_task_tags_task_id"), "task_tags", ["task_id"], unique=False)

    op.create_table(
        "idea_tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("idea_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["idea_id"], ["ideas.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idea_id", "tag_id", name="uq_idea_tag"),
    )
    op.create_index(op.f("ix_idea_tags_idea_id"), "idea_tags", ["idea_id"], unique=False)
    op.create_index(op.f("ix_idea_tags_tag_id"), "idea_tags", ["tag_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_idea_tags_tag_id"), table_name="idea_tags")
    op.drop_index(op.f("ix_idea_tags_idea_id"), table_name="idea_tags")
    op.drop_table("idea_tags")

    op.drop_index(op.f("ix_task_tags_task_id"), table_name="task_tags")
    op.drop_index(op.f("ix_task_tags_tag_id"), table_name="task_tags")
    op.drop_table("task_tags")

    op.drop_index(op.f("ix_activity_logs_owner_id"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_id"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_entity_type"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_entity_id"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_action"), table_name="activity_logs")
    op.drop_table("activity_logs")

    op.drop_index(op.f("ix_ideas_title"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_status"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_project_id"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_owner_id"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_maturity"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_id"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_confidentiality"), table_name="ideas")
    op.drop_index(op.f("ix_ideas_category"), table_name="ideas")
    op.drop_table("ideas")

    op.drop_index(op.f("ix_tasks_title"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_status"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_project_id"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_priority"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_owner_id"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_id"), table_name="tasks")
    op.drop_table("tasks")

    op.drop_index(op.f("ix_tags_owner_id"), table_name="tags")
    op.drop_index(op.f("ix_tags_name"), table_name="tags")
    op.drop_index(op.f("ix_tags_id"), table_name="tags")
    op.drop_table("tags")

    op.drop_constraint("uq_projects_name", "projects", type_="unique")
    op.drop_index(op.f("ix_projects_owner_id"), table_name="projects")
    op.drop_index(op.f("ix_projects_id"), table_name="projects")
    op.drop_table("projects")

    bind = op.get_bind()
    idea_status.drop(bind, checkfirst=True)
    idea_maturity.drop(bind, checkfirst=True)
    idea_confidentiality.drop(bind, checkfirst=True)
    idea_category.drop(bind, checkfirst=True)
    task_priority.drop(bind, checkfirst=True)
    task_status.drop(bind, checkfirst=True)
    project_status.drop(bind, checkfirst=True)
