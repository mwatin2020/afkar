export type DashboardSummary = {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  total_ideas: number;
  sandbox_ideas: number;
  approved_ideas: number;
  frozen_ideas: number;
};

export type Project = { id: number; name: string; description: string | null; status: string };
export type Tag = { id: number; name: string; color: string | null };
export type Task = { id: number; title: string; description: string | null; status: string; priority: string; project_id: number | null; project_name: string | null; tags: Tag[] };
export type Idea = { id: number; created_at: string; updated_at: string; title: string; summary: string; content: string; category: string; confidentiality: string; maturity: string; status: string; decision_note: string | null; project_id: number | null; project_name: string | null; tags: Tag[]; deleted_at?: string | null };
export type ActivityItem = { id: number; entity_type: string; action: string; message: string; created_at: string };
