import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Trash2, Edit, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/types';
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ListViewProps {
  tasks: Task[];
  isLoading: boolean;
  pagination?: {
    page: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const statusIcons = {
  pending: <Circle className="w-4 h-4" />,
  'in-progress': <Clock className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
};

export default function ListView({ tasks, isLoading, pagination, onPageChange, onRefetch }: ListViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const updateStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated');
      onRefetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No tasks found. Create your first task!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task._id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="text-lg font-semibold hover:text-primary transition-colors text-left"
                  >
                    {task.title}
                  </button>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTask(task)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge
                  variant="outline"
                  className={`${priorityColors[task.priority]} text-white border-0`}
                >
                  {task.priority}
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  {statusIcons[task.status]}
                  {task.status}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>

                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Assigned to {task.assignedTo.length} {task.assignedTo.length === 1 ? 'person' : 'people'}
                    </span>
                    <div className="flex -space-x-2">
                      {task.assignedTo.slice(0, 3).map((user) => (
                        <Avatar key={user._id} className="h-6 w-6 border-2 border-background" title={user.name || 'Unknown'}>
                          <AvatarFallback className="text-xs">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignedTo.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center" title={`+${task.assignedTo.length - 3} more`}>
                          <span className="text-xs">+{task.assignedTo.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
          </div>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onSuccess={onRefetch}
        />
      )}

      {deleteTask && (
        <DeleteTaskDialog
          task={deleteTask}
          open={!!deleteTask}
          onOpenChange={(open) => !open && setDeleteTask(null)}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
}
