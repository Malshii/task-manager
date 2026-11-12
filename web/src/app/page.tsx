"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import {
  TaskFormDialog,
  type TaskFormValues,
} from "@/components/task-form-dialog";
import { TaskTable } from "@/components/task-table";
import { TaskToolbar } from "@/components/task-toolbar";
import { Button } from "@/components/ui/button";
import { createTask, deleteTask, getTasks, updateTask } from "@/lib/api";
import {
  getVisibleTasks,
  type SortOrder,
  type StatusFilter,
} from "@/lib/task-view";
import type { Task } from "@/lib/types";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const visibleTasks = useMemo(
    () => getVisibleTasks(tasks, statusFilter, sortOrder),
    [tasks, statusFilter, sortOrder],
  );

  // Loading starts as true, so only the retry handler needs to reset it.
  const loadTasks = useCallback(() => {
    getTasks()
      .then(setTasks)
      .catch((error) =>
        setLoadError(
          error instanceof Error ? error.message : "Failed to load tasks",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError(null);
    loadTasks();
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmit = async (values: TaskFormValues) => {
    if (editingTask) {
      // null clears an optional field on the API.
      const updated = await updateTask(editingTask.id, {
        title: values.title,
        status: values.status,
        description: values.description || null,
        dueDate: values.dueDate || null,
      });
      setTasks((current) =>
        current.map((task) => (task.id === updated.id ? updated : task)),
      );
      toast.success("Task updated");
    } else {
      const created = await createTask({
        title: values.title,
        status: values.status,
        description: values.description || undefined,
        dueDate: values.dueDate || undefined,
      });
      setTasks((current) => [...current, created]);
      toast.success("Task created");
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTasks((current) =>
        current.filter((task) => task.id !== taskToDelete.id),
      );
      toast.success("Task deleted");
      setTaskToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <Button onClick={openCreateForm}>New task</Button>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-muted-foreground">
          Loading tasks...
        </p>
      ) : loadError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 py-12 text-center">
          <p className="text-destructive">{loadError}</p>
          <Button variant="outline" onClick={retryLoad}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {tasks.length > 0 && (
            <TaskToolbar
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortOrder={sortOrder}
              onSortOrderToggle={() =>
                setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
              }
            />
          )}
          {tasks.length > 0 && visibleTasks.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              No tasks match this filter.
            </p>
          ) : (
            <TaskTable
              tasks={visibleTasks}
              onEdit={openEditForm}
              onDelete={setTaskToDelete}
            />
          )}
        </>
      )}

      <TaskFormDialog
        open={isFormOpen}
        task={editingTask}
        onSubmit={handleSubmit}
        onClose={() => setIsFormOpen(false)}
      />
      <DeleteTaskDialog
        task={taskToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </main>
  );
}
