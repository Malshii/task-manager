import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { STATUS_LABELS } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOrder, StatusFilter } from "@/lib/task-view";
import type { TaskStatus } from "@/lib/types";

interface TaskToolbarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
}

export function TaskToolbar({
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderToggle,
}: TaskToolbarProps) {
  const SortIcon = sortOrder === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
      >
        <SelectTrigger aria-label="Filter by status" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onSortOrderToggle}>
        Due date
        <SortIcon data-icon="inline-end" />
      </Button>
    </div>
  );
}
