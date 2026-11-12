"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABELS } from "@/components/status-badge";
import type { Task, TaskStatus } from "@/lib/types";

const MAX_TITLE_LENGTH = 200;

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
}

interface TaskFormDialogProps {
  open: boolean;
  /** The task being edited, or null when creating. */
  task: Task | null;
  /** Should throw if saving fails; the message is shown in the form. */
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onClose: () => void;
}

export function TaskFormDialog({
  open,
  task,
  onSubmit,
  onClose,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details." : "Add a task to your list."}
          </DialogDescription>
        </DialogHeader>
        {/* Dialog content unmounts when closed, so the form resets each time. */}
        <TaskForm task={task} onSubmit={onSubmit} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps {
  task: Task | null;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onClose: () => void;
}

function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "TODO",
    dueDate: task?.dueDate?.slice(0, 10) ?? "",
  });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = <K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!values.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(null);

    setIsSubmitting(true);
    try {
      await onSubmit({ ...values, title: values.title.trim() });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          maxLength={MAX_TITLE_LENGTH}
          aria-invalid={titleError !== null}
          onChange={(event) => setValue("title", event.target.value)}
        />
        {titleError && <p className="text-sm text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) => setValue("status", value as TaskStatus)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            type="date"
            value={values.dueDate}
            onChange={(event) => setValue("dueDate", event.target.value)}
          />
        </div>
      </div>

      {apiError && (
        <p role="alert" className="text-sm text-destructive">
          {apiError}
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : task ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
