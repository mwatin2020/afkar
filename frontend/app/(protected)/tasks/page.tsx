"use client";

import { useEffect, useState } from "react";
import { CheckSquare, CircleDot, FileText, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityBadge } from "@/components/ui/entity-badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Project, Task } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", project_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [savingSelected, setSavingSelected] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
      status: "TODO",
      priority: "MEDIUM",
      project_id: "",
    });
  const [selectedTaskForm, setSelectedTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    project_id: "",
  });
  const { t } = useLanguage();

  const loadProjects = () => api<Project[]>("/projects").then(setProjects);
  const loadTasks = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return api<Task[]>(`/tasks?${params.toString()}`)
      .then((data) => {
        setTasks(data);
        setSelectedTask((current) => (current ? data.find((item) => item.id === current.id) ?? null : null));
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tasks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  useEffect(() => {
    if (!selectedTask) return;
    setSelectedTaskForm({
      title: selectedTask.title,
      description: selectedTask.description ?? "",
      status: selectedTask.status,
      priority: selectedTask.priority,
      project_id: selectedTask.project_id ? String(selectedTask.project_id) : "",
    });
  }, [selectedTask]);

  async function createTask() {
    if (!form.title.trim()) {
      toast.error(t.tasks.taskTitleRequired);
      return;
    }

    setSubmitting(true);
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          status: form.status,
          priority: form.priority,
          project_id: form.project_id ? Number(form.project_id) : null,
          tag_ids: [],
        }),
      });
      setForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        project_id: "",
      });
      setShowCreate(false);
      toast.success(t.tasks.taskCreated);
      await loadTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.tasks.createFailed);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveSelectedTask() {
    if (!selectedTask) return;
    if (!selectedTaskForm.title.trim()) {
      toast.error(t.tasks.taskTitleRequired);
      return;
    }

    setSavingSelected(true);
    try {
      const updated = await api<Task>(`/tasks/${selectedTask.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: selectedTaskForm.title,
          description: selectedTaskForm.description || null,
          status: selectedTaskForm.status,
          priority: selectedTaskForm.priority,
          project_id: selectedTaskForm.project_id ? Number(selectedTaskForm.project_id) : null,
          tag_ids: selectedTask.tags.map((tag) => tag.id),
        }),
      });
      setSelectedTask(updated);
      setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
      setIsEditingSelected(false);
      toast.success("Task updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task.");
    } finally {
      setSavingSelected(false);
    }
  }

  async function deleteSelectedTask() {
    if (!selectedTask) return;

    setDeletingSelected(true);
    try {
      await api(`/tasks/${selectedTask.id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== selectedTask.id));
      setSelectedTask(null);
      setIsEditingSelected(false);
      toast.success("Task deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task.");
    } finally {
      setDeletingSelected(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deletingSelected}
        title="حذف المهمة؟"
        description={selectedTask ? `سيتم حذف المهمة "${selectedTask.title}" نهائيًا.` : "سيتم حذف هذه المهمة نهائيًا."}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteSelectedTask}
      />
      <PageHeader
        title={t.nav.tasks}
        description="Review open work, filter by priority or project, and open a task only when you need its full context."
        actions={
          <Button size="icon" className="h-12 w-12 rounded-2xl" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        }
      />

      {showCreate ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.tasks.newTask}</CardTitle>
              <div className="mt-1 text-sm text-[var(--muted-foreground)]">Capture a task with the right status, priority, and project context.</div>
            </div>
            <Sparkles className="h-5 w-5 text-violet-300" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="field-label">{t.common.title}</label>
              <Input placeholder={t.tasks.taskTitle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">{t.tasks.description}</label>
              <Textarea placeholder={t.tasks.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="field-label">{t.common.status}</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="TODO">{t.tasks.todo}</option>
                <option value="IN_PROGRESS">{t.tasks.inProgress}</option>
                <option value="BLOCKED">{t.tasks.blocked}</option>
                <option value="DONE">{t.tasks.done}</option>
                <option value="ARCHIVED">{t.tasks.archived}</option>
              </Select>
            </div>
            <div>
              <label className="field-label">Priority</label>
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">{t.tasks.low}</option>
                <option value="MEDIUM">{t.tasks.medium}</option>
                <option value="HIGH">{t.tasks.high}</option>
                <option value="CRITICAL">{t.tasks.critical}</option>
              </Select>
            </div>
            <div>
              <label className="field-label">Project</label>
              <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                <option value="">{t.common.noProject}</option>
                {projects.map((project) => (
                  <option key={project.id} value={String(project.id)}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={submitting} onClick={createTask}>
                {submitting ? t.common.creating : t.tasks.createTask}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.tasks.tasks}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 xl:grid-cols-4">
            <Input placeholder={t.tasks.searchTasks} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">{t.common.allStatuses}</option>
              <option value="TODO">{t.tasks.todo}</option>
              <option value="IN_PROGRESS">{t.tasks.inProgress}</option>
              <option value="BLOCKED">{t.tasks.blocked}</option>
              <option value="DONE">{t.tasks.done}</option>
              <option value="ARCHIVED">{t.tasks.archived}</option>
            </Select>
            <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">{t.common.allPriorities}</option>
              <option value="LOW">{t.tasks.low}</option>
              <option value="MEDIUM">{t.tasks.medium}</option>
              <option value="HIGH">{t.tasks.high}</option>
              <option value="CRITICAL">{t.tasks.critical}</option>
            </Select>
            <Select value={filters.project_id} onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}>
              <option value="">{t.common.allProjects}</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          {loading ? <div className="text-sm text-[var(--muted-foreground)]">{t.common.loading}</div> : null}
          {error ? <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {!loading && !error && tasks.length === 0 ? (
                <EmptyState title="No tasks found" description="Adjust your filters or create a new task to start tracking work." icon={<CheckSquare className="h-5 w-5" />} />
              ) : null}
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={`w-full rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/16 ${
                    selectedTask?.id === task.id
                      ? "border-violet-400/25 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(255,255,255,0.03))]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsEditingSelected(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-sm leading-6 text-[var(--muted-foreground)]">{task.description || "No task description yet."}</div>
                    </div>
                    <CircleDot className="mt-1 h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <EntityBadge value={task.status} />
                    <EntityBadge value={task.priority} />
                    {task.project_name ? <EntityBadge value={task.project_name} className="border-white/8 bg-white/[0.03] text-[var(--muted-foreground)]" /> : null}
                  </div>
                </button>
              ))}
            </div>

            <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))]">
              <CardHeader>
                <CardTitle>{selectedTask ? selectedTask.title : "Task Details"}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <EntityBadge value={selectedTask.status} />
                      <EntityBadge value={selectedTask.priority} />
                      {selectedTask.project_name ? (
                        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--muted-foreground)]">{selectedTask.project_name}</div>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => setIsEditingSelected((value) => !value)}>
                        <Pencil className="h-4 w-4" />
                        {isEditingSelected ? t.common.closeEdit : t.common.edit}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} disabled={deletingSelected}>
                        <Trash2 className="h-4 w-4" />
                        {deletingSelected ? t.common.deleting : t.common.delete}
                      </Button>
                    </div>
                    {isEditingSelected ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="field-label">{t.common.title}</label>
                          <Input value={selectedTaskForm.title} onChange={(e) => setSelectedTaskForm({ ...selectedTaskForm, title: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="field-label">{t.tasks.description}</label>
                          <Textarea value={selectedTaskForm.description} onChange={(e) => setSelectedTaskForm({ ...selectedTaskForm, description: e.target.value })} />
                        </div>
                        <div>
                          <label className="field-label">{t.common.status}</label>
                          <Select value={selectedTaskForm.status} onChange={(e) => setSelectedTaskForm({ ...selectedTaskForm, status: e.target.value })}>
                            <option value="TODO">{t.tasks.todo}</option>
                            <option value="IN_PROGRESS">{t.tasks.inProgress}</option>
                            <option value="BLOCKED">{t.tasks.blocked}</option>
                            <option value="DONE">{t.tasks.done}</option>
                            <option value="ARCHIVED">{t.tasks.archived}</option>
                          </Select>
                        </div>
                        <div>
                          <label className="field-label">{t.common.priority}</label>
                          <Select value={selectedTaskForm.priority} onChange={(e) => setSelectedTaskForm({ ...selectedTaskForm, priority: e.target.value })}>
                            <option value="LOW">{t.tasks.low}</option>
                            <option value="MEDIUM">{t.tasks.medium}</option>
                            <option value="HIGH">{t.tasks.high}</option>
                            <option value="CRITICAL">{t.tasks.critical}</option>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="field-label">{t.common.project}</label>
                          <Select value={selectedTaskForm.project_id} onChange={(e) => setSelectedTaskForm({ ...selectedTaskForm, project_id: e.target.value })}>
                            <option value="">{t.common.noProject}</option>
                            {projects.map((project) => (
                              <option key={project.id} value={String(project.id)}>
                                {project.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Button onClick={saveSelectedTask} disabled={savingSelected}>
                            {savingSelected ? t.common.saving : t.common.saveChanges}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6">
                          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            <FileText className="h-4 w-4" />
                            {t.common.description}
                          </div>
                          <div className="mt-4 text-[1.02rem] leading-8 text-white/95">{selectedTask.description || "No task description yet."}</div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                            <div className="text-sm text-[var(--muted-foreground)]">Status</div>
                            <div className="mt-2 text-lg font-medium text-white">{selectedTask.status.replaceAll("_", " ")}</div>
                          </div>
                          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                            <div className="text-sm text-[var(--muted-foreground)]">Priority</div>
                            <div className="mt-2 text-lg font-medium text-white">{selectedTask.priority}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <EmptyState title="Select a task" description="Choose a task from the list to read its full details." icon={<CheckSquare className="h-5 w-5" />} />
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
