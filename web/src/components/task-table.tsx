import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import type { Task } from "@/lib/types";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

// dueDate is a calendar date, so format it in UTC to avoid a day shift.
const formatDueDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { timeZone: "UTC" });

const formatCreated = (value: string) => new Date(value).toLocaleString();

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="font-medium">No tasks yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="max-w-xs whitespace-normal">
              <div className="font-medium">{task.title}</div>
              {task.description && (
                <div className="truncate text-sm text-muted-foreground">
                  {task.description}
                </div>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={task.status} />
            </TableCell>
            <TableCell>
              {task.dueDate ? formatDueDate(task.dueDate) : "-"}
            </TableCell>
            <TableCell>{formatCreated(task.createdAt)}</TableCell>
            <TableCell className="space-x-2 text-right">
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(task)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
