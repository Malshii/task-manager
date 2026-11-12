import type { Task, TaskStatus } from "./types";

export type StatusFilter = TaskStatus | "ALL";
export type SortOrder = "asc" | "desc";

/** Filters by status and sorts by due date; tasks without a due date go last. */
export function getVisibleTasks(
  tasks: Task[],
  statusFilter: StatusFilter,
  sortOrder: SortOrder,
): Task[] {
  const direction = sortOrder === "asc" ? 1 : -1;

  return tasks
    .filter((task) => statusFilter === "ALL" || task.status === statusFilter)
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return (Date.parse(a.dueDate) - Date.parse(b.dueDate)) * direction;
    });
}
