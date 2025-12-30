import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { Task, User } from '@/types';

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export default function AssignTaskDialog({ open, onOpenChange, task }: AssignTaskDialogProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'search', searchEmail],
    queryFn: async () => {
      if (!searchEmail || searchEmail.length < 3) return [];
      const response = await api.get(`/users/search?email=${encodeURIComponent(searchEmail)}`);
      return response.data.users || [];
    },
    enabled: searchEmail.length >= 3,
  });

  const assignMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/users/tasks/${task._id}/assign`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        description: 'Task has been assigned successfully.',
      } as any);
      setSearchEmail('');
    },
    onError: () => {
      toast({
        description: 'Failed to assign user. Please try again.',
        variant: 'destructive',
      } as any);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/tasks/${task._id}/assign/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        description: 'User has been unassigned from this task.',
      } as any);
    },
    onError: () => {
      toast({
        description: 'Failed to remove user. Please try again.',
        variant: 'destructive',
      } as any);
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isUserAssigned = (userId: string) => {
    return task.assignedTo.some((assigned: any) => 
      typeof assigned === 'string' ? assigned === userId : assigned._id === userId
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Search for users by email and assign them to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Assigned to:</h4>
           
            </div>
          )}

          {/* Search Input */}
          <div>
            <h4 className="text-sm font-medium mb-2">Add user:</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchEmail.length >= 3 && searchResults && searchResults.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map((user: any) => (
                <div
                  key={user._id || user.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {isUserAssigned(user._id || user.id) ? (
                    <span className="text-xs text-muted-foreground">Assigned</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => assignMutation.mutate(user._id || user.id)}
                      disabled={assignMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchEmail.length >= 3 && searchResults && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No users found with this email
            </div>
          )}

          {searchEmail.length > 0 && searchEmail.length < 3 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
