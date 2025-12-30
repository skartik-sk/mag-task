import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { X, Edit, Trash2, Users, Calendar as CalendarIcon, Plus } from 'lucide-react';

import api from '@/lib/api';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
  const [assignedEmails, setAssignedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isEditingAssignments, setIsEditingAssignments] = useState(false);

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

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !assignedEmails.includes(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAssignedEmails([...assignedEmails, email]);
      setEmailInput('');
    } else if (email) {
      toast.error('Please enter a valid email address');
    }
  };

  const removeEmail = (email: string) => {
    setAssignedEmails(assignedEmails.filter(e => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const updateAssignments = async () => {
    setIsUpdating(true);
    try {
      await api.put(`/tasks/${task._id}`, {
        assignedEmails: assignedEmails.length > 0 ? assignedEmails : [],
      });
      toast.success('Assignments updated');
      setIsEditingAssignments(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to update assignments');
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

            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assigned To ({task.assignedTo.length})
                  </h3>
                  {!isEditingAssignments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingAssignments(true);
                        setAssignedEmails(task.assignedTo.map(u => u.email));
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingAssignments ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email and press Enter"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button type="button" onClick={addEmail} variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {assignedEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {assignedEmails.map((email) => (
                          <div
                            key={email}
                            className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm"
                          >
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => removeEmail(email)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={updateAssignments}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingAssignments(false);
                          setAssignedEmails([]);
                          setEmailInput('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {task.assignedTo.length > 0 ? (
                      <div className="space-y-2">
                        {task.assignedTo.map((user) => (
                          <div key={user._id} className="flex items-center gap-2">
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
                    ) : (
                      <p className="text-sm text-muted-foreground">No one assigned to this task</p>
                    )}
                  </>
                )}
              </div>
            </>

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
