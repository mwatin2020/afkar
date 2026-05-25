"use client";

import { useEffect, useState } from "react";
import { FileText, FolderKanban, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
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
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", status: "ACTIVE" });
  const [selectedProjectForm, setSelectedProjectForm] = useState({ name: "", description: "", status: "ACTIVE" });
  const [submitting, setSubmitting] = useState(false);
  const [savingSelected, setSavingSelected] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { t } = useLanguage();

  const load = () =>
    api<Project[]>("/projects")
      .then((data) => {
        setProjects(data);
        setSelectedProject((current) => (current ? data.find((item) => item.id === current.id) ?? null : null));
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects."))
      .finally(() => setLoading(false));

  useEffect(() => void load(), []);

  useEffect(() => {
    if (!selectedProject) return;
    setSelectedProjectForm({
      name: selectedProject.name,
      description: selectedProject.description ?? "",
      status: selectedProject.status,
    });
  }, [selectedProject]);

  async function createProject() {
    if (!form.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await api("/projects", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", description: "", status: "ACTIVE" });
      setShowCreate(false);
      toast.success(t.projects.projectCreated);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveSelectedProject() {
    if (!selectedProject) return;
    if (!selectedProjectForm.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setSavingSelected(true);
    try {
      const updated = await api<Project>(`/projects/${selectedProject.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: selectedProjectForm.name,
          description: selectedProjectForm.description || null,
          status: selectedProjectForm.status,
        }),
      });
      setSelectedProject(updated);
      setProjects((current) => current.map((project) => (project.id === updated.id ? updated : project)));
      setIsEditingSelected(false);
      toast.success("Project updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project.");
    } finally {
      setSavingSelected(false);
    }
  }

  async function deleteSelectedProject() {
    if (!selectedProject) return;

    setDeletingSelected(true);
    try {
      await api(`/projects/${selectedProject.id}`, { method: "DELETE" });
      setProjects((current) => current.filter((project) => project.id !== selectedProject.id));
      setSelectedProject(null);
      setIsEditingSelected(false);
      toast.success("Project deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project.");
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
        title="حذف المشروع؟"
        description={selectedProject ? `سيتم حذف المشروع "${selectedProject.name}" نهائيًا.` : "سيتم حذف هذا المشروع نهائيًا."}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteSelectedProject}
      />
      <PageHeader
        title={t.nav.projects}
        description="Keep your workspaces organized, searchable, and easy to review before you add tasks or ideas."
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
              <CardTitle>{t.projects.createProject}</CardTitle>
              <div className="mt-1 text-sm text-[var(--muted-foreground)]">Create a workspace for related tasks and ideas.</div>
            </div>
            <Sparkles className="h-5 w-5 text-violet-300" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="field-label">{t.common.name}</label>
              <Input placeholder={t.projects.projectName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">{t.common.description}</label>
              <Input placeholder={t.common.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="field-label">{t.common.status}</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">{t.projects.active}</option>
                <option value="PAUSED">{t.projects.paused}</option>
                <option value="ARCHIVED">{t.projects.archived}</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={submitting} onClick={createProject}>
                {submitting ? t.common.creating : t.projects.saveProject}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.projects.projects}</CardTitle>
              <div className="mt-1 text-sm text-[var(--muted-foreground)]">{projects.length} workspace{projects.length === 1 ? "" : "s"}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
              <FolderKanban className="h-5 w-5 text-violet-300" />
            </div>
          </CardHeader>
          <CardContent className="mt-2 space-y-4 pe-4 ps-5 pb-10 pt-0 md:pe-5 md:ps-6 md:pb-10">
            {loading ? <div className="text-sm text-[var(--muted-foreground)]">{t.common.loading}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {!loading && !error && projects.length === 0 ? (
              <EmptyState title="No projects yet" description="Create your first project to structure tasks and ideas." icon={<FolderKanban className="h-5 w-5" />} />
            ) : null}
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`w-full rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/16 ${
                  selectedProject?.id === project.id
                    ? "border-violet-400/25 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(255,255,255,0.03))]"
                    : "border-white/8 bg-white/[0.03]"
                }`}
                onClick={() => {
                  setSelectedProject(project);
                  setIsEditingSelected(false);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="font-medium text-white">{project.name}</div>
                    <div className="text-sm leading-6 text-[var(--muted-foreground)]">{project.description || "No description yet."}</div>
                  </div>
                  <EntityBadge value={project.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedProject ? selectedProject.name : "Project Details"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <EntityBadge value={selectedProject.status} />
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
                      <label className="field-label">{t.common.name}</label>
                      <Input value={selectedProjectForm.name} onChange={(e) => setSelectedProjectForm({ ...selectedProjectForm, name: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label">{t.common.description}</label>
                      <Input value={selectedProjectForm.description} onChange={(e) => setSelectedProjectForm({ ...selectedProjectForm, description: e.target.value })} />
                    </div>
                    <div>
                      <label className="field-label">{t.common.status}</label>
                      <Select value={selectedProjectForm.status} onChange={(e) => setSelectedProjectForm({ ...selectedProjectForm, status: e.target.value })}>
                        <option value="ACTIVE">{t.projects.active}</option>
                        <option value="PAUSED">{t.projects.paused}</option>
                        <option value="ARCHIVED">{t.projects.archived}</option>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={saveSelectedProject} disabled={savingSelected}>
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
                      <div className="mt-4 text-[1.02rem] leading-8 text-white/95">{selectedProject.description || "No project description yet."}</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="text-sm text-[var(--muted-foreground)]">Status</div>
                        <div className="mt-2 text-lg font-medium text-white">{selectedProject.status.replaceAll("_", " ")}</div>
                      </div>
                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="text-sm text-[var(--muted-foreground)]">Project ID</div>
                        <div className="mt-2 text-lg font-medium text-white">#{selectedProject.id}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <EmptyState title="Select a project" description="Pick a project from the list to inspect its details." icon={<FolderKanban className="h-5 w-5" />} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
