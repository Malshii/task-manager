import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-secondary text-secondary-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DONE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={cn(STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
