import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { X, Edit, Trash2, Users, Calendar as CalendarIcon } from 'lucide-react';

import api from '@/lib/api';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DeleteTaskDialog from './DeleteTaskDialog';

interface TaskDetailSheetProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function TaskDetailSheet({ task, open, onOpenChange, onSuccess }: TaskDetailSheetProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      await api.patch(`/tasks/${task._id}/status`, { status });
      toast.success('Status updated');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePriority = async (priority: string) => {
    setIsUpdating(true);
    try {
      await api.patch(`/tasks/${task._id}/priority`, { priority });
      toast.success('Priority updated');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update priority');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl pr-8">{task.title}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <Select value={task.status} onValueChange={updateStatus} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Priority</h3>
                <Select value={task.priority} onValueChange={updatePriority} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Due Date
              </h3>
              <p className="text-muted-foreground">
                {format(new Date(task.dueDate), 'PPP')}
              </p>
            </div>

            {task.assignedTo.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assigned To
                  </h3>
                  <div className="space-y-2">
                    {task.assignedTo.map((user) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Created By</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {task.createdBy.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{task.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.createdAt), 'PPP')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteTaskDialog
        task={task}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          setDeleteDialogOpen(false);
          onOpenChange(false);
          onSuccess();
        }}
      />
    </>
  );
}
