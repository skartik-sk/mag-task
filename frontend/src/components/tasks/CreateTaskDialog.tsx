import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialDate?: Date | null;
}

export default function CreateTaskDialog({ open, onOpenChange, onSuccess, initialDate }: CreateTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assignedEmails, setAssignedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      dueDate: initialDate || undefined,
    },
  });

  // Update dueDate when initialDate changes
  useState(() => {
    if (initialDate) {
      setValue('dueDate', initialDate);
    }
  });

  const dueDate = watch('dueDate');
  const priority = watch('priority');

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

  const onSubmit = async (data: TaskForm) => {
    setIsLoading(true);
    try {
      await api.post('/tasks', {
        ...data,
        dueDate: data.dueDate.toISOString(),
        assignedEmails: assignedEmails.length > 0 ? assignedEmails : undefined,
      });
      toast.success('Task created successfully');
      reset();
      setAssignedEmails([]);
      setEmailInput('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task with all the details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <DatePicker
              date={dueDate}
              onSelect={(date) => date && setValue('dueDate', date)}
              placeholder="Pick a date"
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority *</Label>
            <Select value={priority} onValueChange={(value: any) => setValue('priority', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="assignedEmails">Assign Members (by email)</Label>
            <div className="flex gap-2">
              <Input
                id="assignedEmails"
                type="email"
                placeholder="Enter email and press Enter"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={addEmail} variant="outline">
                Add
              </Button>
            </div>
            {assignedEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assignedEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm"
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
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
